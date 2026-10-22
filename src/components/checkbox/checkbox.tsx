import { c, useEvent, useProp, useRef, useState } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { checkIcon } from '../../icons/generated'
import { focusableShadow, useFormControl } from '../../foundation/use-form-control'
import checkboxCss from './checkbox.css?inline'

const checkboxSheet = createStyleSheet(checkboxCss)

// Turns one option on or off. Works in forms like a
// native checkbox.
export const Checkbox = c(
	(props) => {
		const buttonRef = useRef<HTMLButtonElement>()
		const [isChecked, setChecked] = useProp<boolean>('checked')
		const [hasLabelText, setLabelText] = useState(false)
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const isCurrentlyChecked = Boolean(isChecked)
		const defaultCheckedRef = useRef(isCurrentlyChecked)
		const isMissing = Boolean(props.required) && !isCurrentlyChecked
		// Like a native checkbox, it sends its value only
		// while it is on.
		const formValue = isCurrentlyChecked ? props.value : null

		useFormControl({
			formValue,
			isMissing,
			missingMessage: 'Check this box to continue.',
			anchorRef: buttonRef,
			handleReset: () => setChecked(defaultCheckedRef.current)
		})

		const checkedClass = getFlagClass(isCurrentlyChecked, 'isChecked')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['choice', 'checkbox', checkedClass, disabledClass])
		const checkedLabel = String(isCurrentlyChecked)
		const emptyLabelClass = getFlagClass(!hasLabelText, 'isEmpty')
		const labelClassName = buildClassName(['choice-label', emptyLabelClass])

		// A control with no text of its own drops the
		// label gap, so it can sit inside a fem-field.
		const handleSlotChange = (event: Event) => {
			const slotElement = event.currentTarget as HTMLSlotElement
			const slotText = slotElement.assignedNodes().map((node) => node.textContent ?? '').join('')
			const hasText = slotText.trim() !== ''
			setLabelText(hasText)
		}

		const handleClick = () => {
			setChecked(!isCurrentlyChecked)
			dispatchChange()
		}

		return (
			<host shadowDom={focusableShadow}>
				<button
					ref={buttonRef}
					class={className}
					role='checkbox'
					aria-checked={checkedLabel}
					aria-required={props.required}
					aria-label={props.label}
					disabled={props.disabled}
					onclick={handleClick}
				>
					<span class='checkbox-mark'>
						<IconSvg icon={checkIcon} kind='bold' />
					</span>
					<span class={labelClassName}>
						<slot onslotchange={handleSlotChange}></slot>
					</span>
				</button>
			</host>
		)
	},
	{
		form: true,
		props: {
			name: { type: String, reflect: true },
			value: { type: String, value: (): string => 'on' },
			checked: { type: Boolean, reflect: true },
			required: { type: Boolean, reflect: true },
			label: String,
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, checkboxSheet]
	}
)
