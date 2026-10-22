import { c, useEvent, useHost, useProp, useState } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { caretRightIcon } from '../../icons/generated'
import treeItemCss from './tree-item.css?inline'

const treeItemSheet = createStyleSheet(treeItemCss)

// How many tree items wrap this one. Sets the indent.
const getDepth = (element: Element | null | undefined): number => {
	const parentItem = element?.parentElement?.closest('fem-tree-item')
	if (!parentItem) return 0
	return 1 + getDepth(parentItem)
}

// One row in a fem-tree. Nested tree items are its
// children. The caret opens and closes them.
export const TreeItem = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()
		const [isExpanded, setExpanded] = useProp<boolean>('expanded')
		const [hasChildren, setHasChildren] = useState(false)
		const dispatchToggle = useEvent('toggle', { bubbles: true, composed: true })

		const depth = getDepth(hostRef.current)
		const isCurrentlyExpanded = Boolean(isExpanded)
		const expandedClass = getFlagClass(isCurrentlyExpanded, 'isExpanded')
		const selectedClass = getFlagClass(props.selected, 'isSelected')
		const parentClass = getFlagClass(hasChildren, 'isParent')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const rowClassName = buildClassName(['tree-row', expandedClass, selectedClass, parentClass, disabledClass])
		const expandedLabel = hasChildren ? String(isCurrentlyExpanded) : undefined
		const selectedLabel = String(Boolean(props.selected))
		// The selected row is where Tab lands.
		const rowTabIndex = props.selected ? '0' : '-1'
		const depthStyle = `--tree-depth: ${depth}`

		const handleChildrenChange = (event: Event) => {
			const slotElement = event.currentTarget as HTMLSlotElement
			const childItems = slotElement.assignedElements().filter((element) => element.localName === 'fem-tree-item')
			setHasChildren(childItems.length > 0)
		}

		// The caret only opens and closes. It never
		// selects the row.
		const handleCaretClick = (event: Event) => {
			event.stopPropagation()
			setExpanded(!isCurrentlyExpanded)
			dispatchToggle()
		}

		return (
			<host shadowDom role='treeitem' aria-expanded={expandedLabel} aria-selected={selectedLabel}>
				<div class={rowClassName} style={depthStyle} tabindex={rowTabIndex}>
					<span class='tree-caret' onclick={handleCaretClick} aria-hidden='true'>
						<IconSvg icon={caretRightIcon} kind='bold' />
					</span>
					<slot name='icon'></slot>
					<span class='tree-label'>{props.label}</span>
					<span class='tree-end'>
						<slot name='end'></slot>
					</span>
				</div>
				<div class='tree-children' role='group'>
					<div class='tree-children-inner'>
						<slot onslotchange={handleChildrenChange}></slot>
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true, value: (): string => '' },
			label: { type: String, value: (): string => '' },
			expanded: { type: Boolean, reflect: true },
			// Set by fem-tree from its value.
			selected: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, treeItemSheet]
	}
)
