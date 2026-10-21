import { c, useEffect, useEvent, useHost, useProp, useRef, useState } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { useFloatingPopover } from '../../foundation/use-floating-popover'
import { focusableShadow, useFormControl } from '../../foundation/use-form-control'
import { caretDownIcon } from '../../icons/generated'
import comboboxCss from './combobox.css?inline'

export type ComboboxSizeT = 'small' | 'medium' | 'large'

type OptionElementT = HTMLElement & { value: string; selected: boolean; disabled: boolean; active: boolean }

const comboboxSheet = createStyleSheet(comboboxCss)

const getOptions = (hostElement: HTMLElement): OptionElementT[] => {
	return [...hostElement.querySelectorAll<OptionElementT>('fem-option')]
}

const getOptionText = (option: OptionElementT): string => {
	return (option.textContent ?? '').trim()
}

const checkOptionMatches = (option: OptionElementT, query: string): boolean => {
	const normalizedQuery = query.trim().toLowerCase()
	const hasQuery = normalizedQuery !== ''
	if (!hasQuery) return true
	return getOptionText(option).toLowerCase().includes(normalizedQuery)
}

const findClickedOption = (event: Event): OptionElementT | undefined => {
	const clickPath = event.composedPath()
	const isOption = (target: EventTarget) => target instanceof HTMLElement && target.localName === 'fem-option'
	return clickPath.find(isOption) as OptionElementT | undefined
}

const stepIndex = (currentIndex: number, step: number, itemCount: number): number => {
	const hasItems = itemCount > 0
	if (!hasItems) return -1
	const hasCurrent = currentIndex !== -1
	if (!hasCurrent) return step > 0 ? 0 : itemCount - 1
	return (currentIndex + step + itemCount) % itemCount
}

// A select you can type into. Typing filters the
// options. Arrow keys move, Enter picks, Escape
// closes and puts the chosen label back.
export const Combobox = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()
		const fieldRef = useRef<HTMLDivElement>()
		const inputRef = useRef<HTMLInputElement>()
		const panelRef = useRef<HTMLDivElement>()

		const [value, setValue] = useProp<string>('value')
		const [isOpen, setOpen] = useState(false)
		// Null while the input shows the chosen label.
		// A string while the person is typing.
		const [query, setQuery] = useState<string | null>(null)
		const [activeIndex, setActiveIndex] = useState(-1)
		const [optionsVersion, setOptionsVersion] = useState(0)
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const currentValue = value ?? ''
		const defaultValueRef = useRef(currentValue)
		const isMissing = Boolean(props.required) && currentValue === ''

		useFormControl({
			formValue: currentValue,
			isMissing,
			missingMessage: 'Pick an option.',
			anchorRef: inputRef,
			handleReset: () => setValue(defaultValueRef.current)
		})

		const options = getOptions(hostRef.current)
		const selectedOption = options.find((option) => option.value === currentValue)
		const selectedLabel = selectedOption ? getOptionText(selectedOption) : ''
		const isTyping = query !== null
		const inputText = isTyping ? query : selectedLabel
		const filterText = query ?? ''
		const visibleOptions = options.filter((option) => checkOptionMatches(option, filterText))
		const enabledVisibleOptions = visibleOptions.filter((option) => !option.disabled)
		const hasMatches = visibleOptions.length > 0

		// Keeps each option's flags in step: hidden when
		// filtered out, selected for the value, active
		// under the arrow keys.
		useEffect(() => {
			const activeOption = enabledVisibleOptions[activeIndex]
			for (const option of options) {
				option.hidden = !visibleOptions.includes(option)
				option.selected = option.value === currentValue
				option.active = option === activeOption
			}
		}, [filterText, currentValue, activeIndex, optionsVersion])

		useFloatingPopover(fieldRef, panelRef, isOpen, { placement: 'below', alignment: 'start' })

		const openPanel = () => {
			if (props.disabled) return
			setOpen(true)
		}

		const closePanel = () => {
			setOpen(false)
			setQuery(null)
			setActiveIndex(-1)
		}

		const pickOption = (option: OptionElementT) => {
			if (option.disabled) return
			closePanel()
			const isSameValue = option.value === currentValue
			if (isSameValue) return
			setValue(option.value)
			dispatchChange()
		}

		const handleInput = (event: Event) => {
			const inputElement = event.currentTarget as HTMLInputElement
			setQuery(inputElement.value)
			setActiveIndex(0)
			openPanel()
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			const isDown = event.key === 'ArrowDown'
			const isUp = event.key === 'ArrowUp'
			const isArrow = isDown || isUp
			if (isArrow) {
				event.preventDefault()
				openPanel()
				const step = isDown ? 1 : -1
				setActiveIndex(stepIndex(activeIndex, step, enabledVisibleOptions.length))
				return
			}

			const isEnter = event.key === 'Enter'
			const activeOption = enabledVisibleOptions[activeIndex]
			const canPick = isEnter && isOpen && activeOption !== undefined
			if (canPick) {
				event.preventDefault()
				pickOption(activeOption)
				return
			}

			const isEscape = event.key === 'Escape'
			if (isEscape) closePanel()
		}

		// Pressing inside the panel keeps focus in the
		// input, so typing never stops.
		const handlePanelPointerDown = (event: Event) => event.preventDefault()

		const handlePanelClick = (event: Event) => {
			const clickedOption = findClickedOption(event)
			if (clickedOption) pickOption(clickedOption)
		}

		const handleBlur = () => closePanel()
		const handleSlotChange = () => setOptionsVersion(optionsVersion + 1)

		const sizeClass = getModifierClass(props.size)
		const openClass = getFlagClass(isOpen, 'isOpen')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const fieldClassName = buildClassName(['combobox', sizeClass, openClass, disabledClass])
		const expandedLabel = String(isOpen)
		const emptyRow = hasMatches ? null : <span class='combobox-empty'>{props.emptyText}</span>

		return (
			<host shadowDom={focusableShadow}>
				<div ref={fieldRef} class={fieldClassName}>
					<input
						ref={inputRef}
						class='combobox-input'
						role='combobox'
						aria-expanded={expandedLabel}
						aria-autocomplete='list'
						aria-label={props.label}
						value={inputText}
						placeholder={props.placeholder}
						disabled={props.disabled}
						autocomplete='off'
						oninput={handleInput}
						onkeydown={handleKeyDown}
						onclick={openPanel}
						onblur={handleBlur}
					/>
					<IconSvg icon={caretDownIcon} kind='bold' />
				</div>

				<div
					ref={panelRef}
					class='floating-panel isAnchorWidth'
					popover='manual'
					role='listbox'
					onpointerdown={handlePanelPointerDown}
					onclick={handlePanelClick}
				>
					<slot onslotchange={handleSlotChange}></slot>
					{emptyRow}
				</div>
			</host>
		)
	},
	{
		form: true,
		props: {
			name: { type: String, reflect: true },
			value: { type: String, reflect: true, value: (): string => '' },
			placeholder: { type: String, value: (): string => '' },
			label: String,
			emptyText: { type: String, value: (): string => 'No matches' },
			size: { type: String, reflect: true, value: (): ComboboxSizeT => 'medium' },
			required: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, comboboxSheet]
	}
)
