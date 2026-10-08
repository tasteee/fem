import { c, useEffect, useEvent, useHost, useProp, useRef, useState } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { ChevronDownIcon } from '../../foundation/icons'
import { usePressFeedback } from '../../foundation/use-press-feedback'
import selectCss from './select.css?inline'

export type SelectSizeT = 'small' | 'medium' | 'large'

type OptionElementT = HTMLElement & { value: string; selected: boolean; disabled: boolean }

const selectSheet = createStyleSheet(selectCss)

const getOptions = (hostElement: HTMLElement): OptionElementT[] => {
	return [...hostElement.querySelectorAll<OptionElementT>('fem-option')]
}

const findClickedOption = (event: Event): OptionElementT | undefined => {
	const clickPath = event.composedPath()
	const isOption = (target: EventTarget) => target instanceof HTMLElement && target.localName === 'fem-option'
	return clickPath.find(isOption) as OptionElementT | undefined
}

export const Select = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()
		const triggerRef = useRef<HTMLButtonElement>()
		usePressFeedback(triggerRef)

		const [value, setValue] = useProp<string>('value')
		const [isOpen, setOpen] = useState(false)
		// Bumped when options are added or removed, so
		// the label is read again.
		const [optionsVersion, setOptionsVersion] = useState(0)
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const options = getOptions(hostRef.current)
		const selectedOption = options.find((option) => option.value === value)
		const hasSelection = selectedOption !== undefined
		const labelText = hasSelection ? selectedOption.textContent : props.placeholder

		// Keeps each option's selected flag in step with
		// the select's value.
		useEffect(() => {
			for (const option of options) option.selected = option.value === value
		}, [value, optionsVersion])

		useEffect(() => {
			if (!isOpen) return

			const handleOutsidePress = (event: Event) => {
				const isInside = event.composedPath().includes(hostRef.current)
				if (!isInside) setOpen(false)
			}

			const handleKeyDown = (event: KeyboardEvent) => {
				const isEscape = event.key === 'Escape'
				if (isEscape) setOpen(false)
			}

			document.addEventListener('pointerdown', handleOutsidePress)
			document.addEventListener('keydown', handleKeyDown)

			const removeListeners = () => {
				document.removeEventListener('pointerdown', handleOutsidePress)
				document.removeEventListener('keydown', handleKeyDown)
			}

			return removeListeners
		}, [isOpen])

		const handleTriggerClick = () => setOpen(!isOpen)
		const handleSlotChange = () => setOptionsVersion(optionsVersion + 1)

		const handleMenuClick = (event: Event) => {
			const clickedOption = findClickedOption(event)
			if (!clickedOption) return
			if (clickedOption.disabled) return
			setOpen(false)
			const isSameValue = clickedOption.value === value
			if (isSameValue) return
			setValue(clickedOption.value)
			dispatchChange()
		}

		const sizeClass = getModifierClass(props.size)
		const placeholderClass = getFlagClass(!hasSelection, 'isPlaceholder')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const triggerClassName = buildClassName(['select', 'isPressable', sizeClass, placeholderClass, disabledClass])
		const openClass = getFlagClass(isOpen, 'isOpen')
		const menuClassName = buildClassName(['select-menu', openClass])
		const expandedLabel = String(isOpen)

		return (
			<host shadowDom>
				<button
					ref={triggerRef}
					class={triggerClassName}
					disabled={props.disabled}
					aria-haspopup='listbox'
					aria-expanded={expandedLabel}
					aria-label={props.label}
					onclick={handleTriggerClick}
				>
					<span class='select-label'>{labelText}</span>
					<ChevronDownIcon />
				</button>

				<div class={menuClassName} role='listbox' onclick={handleMenuClick}>
					<slot onslotchange={handleSlotChange}></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			size: { type: String, reflect: true, value: (): SelectSizeT => 'medium' },
			value: { type: String, reflect: true, value: (): string => '' },
			placeholder: { type: String, value: (): string => '' },
			label: String,
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, selectSheet]
	}
)
