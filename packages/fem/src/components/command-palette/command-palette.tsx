import { c, useEffect, useEvent, useHost, useProp, useRef, useState } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { checkIsBackdropClick, useModal } from '../../foundation/use-modal'
import { useSlidingIndicator } from '../../foundation/use-sliding-indicator'
import { magnifyingGlassIcon } from '../../icons/generated'
import commandPaletteCss from './command-palette.css?inline'

type CommandItemElementT = HTMLElement & { value: string; keywords: string; active: boolean; disabled: boolean }

type SelectDetailT = { value: string }

const commandPaletteSheet = createStyleSheet(commandPaletteCss)

const getItems = (hostElement: HTMLElement): CommandItemElementT[] => {
	return [...hostElement.querySelectorAll<CommandItemElementT>('fem-command-item')]
}

const checkItemMatches = (item: CommandItemElementT, query: string): boolean => {
	const normalizedQuery = query.trim().toLowerCase()
	const hasQuery = normalizedQuery !== ''
	if (!hasQuery) return true
	const searchableText = `${item.textContent ?? ''} ${item.keywords}`.toLowerCase()
	return searchableText.includes(normalizedQuery)
}

// A group is shown only while one of its commands is.
const syncGroups = (hostElement: HTMLElement) => {
	const groups = [...hostElement.querySelectorAll<HTMLElement>('fem-command-group')]
	for (const group of groups) {
		const groupItems = [...group.querySelectorAll<HTMLElement>('fem-command-item')]
		const hasVisibleItem = groupItems.some((item) => !item.hidden)
		group.hidden = !hasVisibleItem
	}
}

// "mod+k" means ⌘K on a Mac and Ctrl+K elsewhere.
const checkHotkey = (event: KeyboardEvent, hotkey: string): boolean => {
	const hasHotkey = hotkey !== ''
	if (!hasHotkey) return false
	const keyParts = hotkey.toLowerCase().split('+')
	const mainKey = keyParts[keyParts.length - 1]
	const needsModifier = keyParts.includes('mod')
	const hasModifier = event.metaKey || event.ctrlKey
	const isModifierMatch = needsModifier ? hasModifier : !hasModifier
	const isKeyMatch = event.key.toLowerCase() === mainKey
	return isModifierMatch && isKeyMatch
}

const findClickedItem = (event: Event): CommandItemElementT | undefined => {
	const clickPath = event.composedPath()
	const isItem = (target: EventTarget) => target instanceof HTMLElement && target.localName === 'fem-command-item'
	return clickPath.find(isItem) as CommandItemElementT | undefined
}

// Search and run any command from the keyboard. Opens
// with ⌘K or Ctrl+K. The highlight slides between
// commands, like every selection in fem.
export const CommandPalette = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()
		const dialogRef = useRef<HTMLDialogElement>()
		const inputRef = useRef<HTMLInputElement>()
		const listRef = useRef<HTMLDivElement>()
		const indicatorRef = useRef<HTMLSpanElement>()
		const [isOpen, setOpen] = useProp<boolean>('open')
		const [query, setQuery] = useState('')
		const [activeIndex, setActiveIndex] = useState(0)
		const [itemsVersion, setItemsVersion] = useState(0)
		const dispatchSelect = useEvent<SelectDetailT>('select', { bubbles: true, composed: true })

		const isPaletteOpen = Boolean(isOpen)
		useModal(dialogRef, isPaletteOpen)

		const items = getItems(hostRef.current)
		const visibleItems = items.filter((item) => checkItemMatches(item, query))
		const enabledItems = visibleItems.filter((item) => !item.disabled)
		const safeActiveIndex = Math.min(activeIndex, Math.max(0, enabledItems.length - 1))
		const activeItem = enabledItems[safeActiveIndex]
		const hasMatches = visibleItems.length > 0
		const activeKey = activeItem ? `${activeItem.value}:${query}` : query

		const slide = useSlidingIndicator({
			hostRef,
			trackRef: listRef,
			indicatorRef,
			itemTagName: 'fem-command-item',
			value: activeKey,
			findSelectedItem: () => activeItem
		})

		// Keeps each command's flags in step with the
		// search and the active row.
		useEffect(() => {
			for (const item of items) {
				item.hidden = !visibleItems.includes(item)
				item.active = item === activeItem
			}
			syncGroups(hostRef.current)
			activeItem?.scrollIntoView({ block: 'nearest' })
		}, [query, safeActiveIndex, itemsVersion, isPaletteOpen])

		// A filtered list reflows, so the highlight jumps
		// to its new spot instead of sliding.
		useEffect(() => slide.handleItemsChange(), [query, isPaletteOpen])

		// Each open starts fresh, with the input focused.
		useEffect(() => {
			if (!isPaletteOpen) return
			setQuery('')
			setActiveIndex(0)
			inputRef.current?.focus()
		}, [isPaletteOpen])

		useEffect(() => {
			const handleDocumentKeyDown = (event: KeyboardEvent) => {
				const isHotkey = checkHotkey(event, props.hotkey)
				if (!isHotkey) return
				event.preventDefault()
				setOpen(!hostRef.current.hasAttribute('open'))
			}
			document.addEventListener('keydown', handleDocumentKeyDown)
			return () => document.removeEventListener('keydown', handleDocumentKeyDown)
		}, [props.hotkey])

		const runItem = (item: CommandItemElementT | undefined) => {
			if (!item) return
			if (item.disabled) return
			setOpen(false)
			dispatchSelect({ value: item.value })
		}

		const handleInput = (event: Event) => {
			const inputElement = event.currentTarget as HTMLInputElement
			setQuery(inputElement.value)
			setActiveIndex(0)
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			const isDown = event.key === 'ArrowDown'
			const isUp = event.key === 'ArrowUp'
			const itemCount = enabledItems.length
			const hasItems = itemCount > 0
			if (isDown && hasItems) {
				event.preventDefault()
				setActiveIndex((safeActiveIndex + 1) % itemCount)
				return
			}
			if (isUp && hasItems) {
				event.preventDefault()
				setActiveIndex((safeActiveIndex - 1 + itemCount) % itemCount)
				return
			}
			const isEnter = event.key === 'Enter'
			if (!isEnter) return
			event.preventDefault()
			runItem(activeItem)
		}

		// The pointer moves the highlight too.
		const handlePointerOver = (event: Event) => {
			const hoveredItem = findClickedItem(event)
			if (!hoveredItem) return
			const hoveredIndex = enabledItems.indexOf(hoveredItem)
			const isEnabled = hoveredIndex !== -1
			if (isEnabled) setActiveIndex(hoveredIndex)
		}

		const handleListClick = (event: Event) => runItem(findClickedItem(event))
		const handleClose = () => setOpen(false)
		const handleSlotChange = () => setItemsVersion(itemsVersion + 1)

		const handleDialogClick = (event: Event) => {
			const isBackdropClick = checkIsBackdropClick(event)
			if (isBackdropClick) setOpen(false)
		}

		const emptyRow = hasMatches ? null : <span class='command-palette-empty'>{props.emptyText}</span>

		return (
			<host shadowDom>
				<dialog
					ref={dialogRef}
					class='command-palette'
					aria-label={props.label}
					onclose={handleClose}
					onclick={handleDialogClick}
				>
					<div class='command-palette-search'>
						<IconSvg icon={magnifyingGlassIcon} kind='bold' />
						<input
							ref={inputRef}
							class='command-palette-input'
							role='combobox'
							aria-expanded='true'
							aria-autocomplete='list'
							aria-label={props.label}
							placeholder={props.placeholder}
							value={query}
							autocomplete='off'
							oninput={handleInput}
							onkeydown={handleKeyDown}
						/>
					</div>
					<div
						ref={listRef}
						class='command-palette-list'
						role='listbox'
						onclick={handleListClick}
						onpointerover={handlePointerOver}
					>
						<span ref={indicatorRef} class='slide-indicator command-palette-indicator' aria-hidden='true'></span>
						<slot onslotchange={handleSlotChange}></slot>
						{emptyRow}
					</div>
				</dialog>
			</host>
		)
	},
	{
		props: {
			open: { type: Boolean, reflect: true },
			label: { type: String, value: (): string => 'Command palette' },
			placeholder: { type: String, value: (): string => 'Search commands' },
			emptyText: { type: String, value: (): string => 'No matching commands' },
			// Set to an empty string to turn the shortcut off.
			hotkey: { type: String, value: (): string => 'mod+k' }
		},
		styles: [foundationSheet, commandPaletteSheet]
	}
)
