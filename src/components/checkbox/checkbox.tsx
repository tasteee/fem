import { c, useEvent, useProp, useRef } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { CheckIcon } from '../../foundation/icons'
import { focusableShadow, useFormControl } from '../../foundation/use-form-control'
import checkboxCss from './checkbox.css?inline'

const checkboxSheet = createStyleSheet(checkboxCss)

export const Checkbox = c(
	(props) => {
		const buttonRef = useRef<HTMLButtonElement>()
		const [isChecked, setChecked] = useProp<boolean>('checked')
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
					disabled={props.disabled}
					onclick={handleClick}
				>
					<span class='checkbox-mark'>
						<CheckIcon />
					</span>
					<span class='choice-label'>
						<slot></slot>
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
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, checkboxSheet]
	}
)
