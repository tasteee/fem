import { c, useEffect, useEvent, useHost, useProp, useRef } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { useSlidingIndicator } from '../../foundation/use-sliding-indicator'
import treeCss from './tree.css?inline'

type TreeItemElementT = HTMLElement & { value: string; selected: boolean; expanded: boolean; disabled: boolean }

const treeSheet = createStyleSheet(treeCss)

const getAllItems = (hostElement: HTMLElement): TreeItemElementT[] => {
	return [...hostElement.querySelectorAll<TreeItemElementT>('fem-tree-item')]
}

const getParentItem = (item: TreeItemElementT): TreeItemElementT | null => {
	return item.parentElement?.closest<TreeItemElementT>('fem-tree-item') ?? null
}

// An item is on screen only while every item above
// it is open.
const checkItemVisible = (item: TreeItemElementT): boolean => {
	const parentItem = getParentItem(item)
	if (!parentItem) return true
	if (!parentItem.expanded) return false
	return checkItemVisible(parentItem)
}

const getChildItems = (item: TreeItemElementT): TreeItemElementT[] => {
	const directChildren = [...item.children] as TreeItemElementT[]
	return directChildren.filter((child) => child.localName === 'fem-tree-item')
}

const getRow = (item: TreeItemElementT | undefined): HTMLElement | undefined => {
	return item?.shadowRoot?.querySelector<HTMLElement>('.tree-row') ?? undefined
}

const focusItem = (item: TreeItemElementT | undefined | null) => {
	if (!item) return
	getRow(item)?.focus()
}

// The innermost tree item in an event's path. Nested
// items sit inside their parents.
const findEventItem = (event: Event): TreeItemElementT | undefined => {
	const eventPath = event.composedPath()
	const isItem = (target: EventTarget) => target instanceof HTMLElement && target.localName === 'fem-tree-item'
	return eventPath.find(isItem) as TreeItemElementT | undefined
}

// Nested items, like folders and files. The selected
// row's fill slides, even across levels.
export const Tree = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()
		const trackRef = useRef<HTMLDivElement>()
		const indicatorRef = useRef<HTMLSpanElement>()
		const [value, setValue] = useProp<string>('value')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const findSelectedRow = () => {
			const items = getAllItems(hostRef.current)
			const selectedItem = items.find((item) => item.value === value)
			const isVisible = selectedItem ? checkItemVisible(selectedItem) : false
			if (!isVisible) return undefined
			return getRow(selectedItem)
		}

		useSlidingIndicator({
			hostRef,
			trackRef,
			indicatorRef,
			itemTagName: 'fem-tree-item',
			value,
			findSelectedItem: findSelectedRow
		})

		const syncSelected = () => {
			for (const item of getAllItems(hostRef.current)) item.selected = item.value === value
		}

		useEffect(syncSelected, [value])

		const selectItem = (item: TreeItemElementT) => {
			if (item.disabled) return
			const isSameValue = item.value === value
			if (isSameValue) return
			setValue(item.value)
			dispatchChange()
		}

		const handleClick = (event: Event) => {
			const clickedItem = findEventItem(event)
			if (clickedItem) selectItem(clickedItem)
		}

		const moveFocus = (currentItem: TreeItemElementT, step: number) => {
			const visibleItems = getAllItems(hostRef.current).filter(checkItemVisible)
			const currentIndex = visibleItems.indexOf(currentItem)
			const nextItem = visibleItems[currentIndex + step]
			focusItem(nextItem)
		}

		// Right opens a closed item, then moves into it.
		const handleRight = (currentItem: TreeItemElementT) => {
			const childItems = getChildItems(currentItem)
			const hasChildren = childItems.length > 0
			if (!hasChildren) return
			if (!currentItem.expanded) {
				currentItem.expanded = true
				return
			}
			focusItem(childItems[0])
		}

		// Left closes an open item, or moves to its parent.
		const handleLeft = (currentItem: TreeItemElementT) => {
			const isOpenParent = currentItem.expanded && getChildItems(currentItem).length > 0
			if (isOpenParent) {
				currentItem.expanded = false
				return
			}
			focusItem(getParentItem(currentItem))
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			const currentItem = findEventItem(event)
			if (!currentItem) return
			const keyHandlers: Record<string, () => void> = {
				ArrowDown: () => moveFocus(currentItem, 1),
				ArrowUp: () => moveFocus(currentItem, -1),
				ArrowRight: () => handleRight(currentItem),
				ArrowLeft: () => handleLeft(currentItem),
				Enter: () => selectItem(currentItem),
				' ': () => selectItem(currentItem)
			}
			const keyHandler = keyHandlers[event.key]
			if (!keyHandler) return
			event.preventDefault()
			keyHandler()
		}

		return (
			<host shadowDom>
				<div
					ref={trackRef}
					class='tree'
					role='tree'
					aria-label={props.label}
					onclick={handleClick}
					onkeydown={handleKeyDown}
				>
					<span ref={indicatorRef} class='slide-indicator tree-indicator' aria-hidden='true'></span>
					<slot onslotchange={syncSelected}></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true, value: (): string => '' },
			label: String
		},
		styles: [foundationSheet, treeSheet]
	}
)
