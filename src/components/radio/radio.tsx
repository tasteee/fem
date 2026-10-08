import { c, useEvent, useHost, useProp, useRef } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { focusableShadow, useFormControl } from '../../foundation/use-form-control'
import radioCss from './radio.css?inline'

type RadioElementT = HTMLElement & { checked: boolean; name: string }

const radioSheet = createStyleSheet(radioCss)

// Radios with the same name in the same document or
// shadow root form one group.
const getGroupRadios = (radioElement: RadioElementT): RadioElementT[] => {
	const rootNode = radioElement.getRootNode() as ParentNode
	const allRadios = [...rootNode.querySelectorAll<RadioElementT>('fem-radio')]
	return allRadios.filter((otherRadio) => otherRadio.name === radioElement.name)
}

const uncheckOtherRadios = (radioElement: RadioElementT) => {
	const groupRadios = getGroupRadios(radioElement)

	for (const groupRadio of groupRadios) {
		const isSelf = groupRadio === radioElement
		if (!isSelf) groupRadio.checked = false
	}
}

export const Radio = c(
	(props) => {
		const hostRef = useHost<RadioElementT>()
		const [isChecked, setChecked] = useProp<boolean>('checked')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const buttonRef = useRef<HTMLButtonElement>()
		const isCurrentlyChecked = Boolean(isChecked)
		const defaultCheckedRef = useRef(isCurrentlyChecked)
		// Only the checked radio in a group sends a value.
		const formValue = isCurrentlyChecked ? props.value : null

		useFormControl({
			formValue,
			isMissing: false,
			missingMessage: '',
			anchorRef: buttonRef,
			handleReset: () => setChecked(defaultCheckedRef.current)
		})

		const checkedClass = getFlagClass(isChecked, 'isChecked')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['choice', 'radio', checkedClass, disabledClass])
		const checkedLabel = String(Boolean(isChecked))

		const handleClick = () => {
			if (isChecked) return
			uncheckOtherRadios(hostRef.current)
			setChecked(true)
			dispatchChange()
		}

		return (
			<host shadowDom={focusableShadow}>
				<button
					ref={buttonRef}
					class={className}
					role='radio'
					aria-checked={checkedLabel}
					disabled={props.disabled}
					onclick={handleClick}
				>
					<span class='radio-mark'>
						<span class='radio-dot'></span>
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
			name: { type: String, reflect: true, value: (): string => '' },
			value: { type: String, reflect: true, value: (): string => '' },
			checked: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, radioSheet]
	}
)
