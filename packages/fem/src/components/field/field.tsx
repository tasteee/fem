import { c, useEffect, useRef, useState } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import fieldCss from './field.css?inline'

export type FieldLayoutT = 'stacked' | 'inline'

const fieldSheet = createStyleSheet(fieldCss)

// Toggles act on a label tap, like a native label.
// Everything else just takes focus.
const toggleTagNames = ['fem-switch', 'fem-checkbox']

const getSlottedControl = (slotElement: HTMLSlotElement): HTMLElement | undefined => {
	const assignedElements = slotElement.assignedElements()
	return assignedElements[0] as HTMLElement | undefined
}

const pressControl = (control: HTMLElement) => {
	const isToggle = toggleTagNames.includes(control.localName)
	if (!isToggle) return control.focus()
	const innerButton = control.shadowRoot?.querySelector('button')
	innerButton?.click()
}

// Owns the label, help, and error for one control,
// so every control in the system is labeled the same
// way. Stacked puts the label above. Inline puts it
// on the left with the control on the right.
export const Field = c(
	(props) => {
		const slotRef = useRef<HTMLSlotElement>()
		const [control, setControl] = useState<HTMLElement | undefined>(undefined)
		const wasMarkedInvalidRef = useRef(false)

		const hasHelp = Boolean(props.help)
		const hasError = Boolean(props.error)
		const shouldShowHelp = hasHelp && !hasError

		// The visible label is ours, so the control gets
		// the same text as its accessible name.
		useEffect(() => {
			if (!control) return
			const hasOwnLabel = control.hasAttribute('label')
			if (hasOwnLabel) return
			if (props.label) control.setAttribute('label', props.label)
		}, [control, props.label])

		// An error marks the control invalid. Only a mark
		// set here is cleared here.
		useEffect(() => {
			if (!control) return
			if (hasError) {
				wasMarkedInvalidRef.current = true
				control.setAttribute('invalid', '')
				return
			}
			if (!wasMarkedInvalidRef.current) return
			wasMarkedInvalidRef.current = false
			control.removeAttribute('invalid')
		}, [control, hasError])

		const handleSlotChange = () => {
			const slotElement = slotRef.current
			if (!slotElement) return
			setControl(getSlottedControl(slotElement))
		}

		const handleLabelClick = () => {
			if (control) pressControl(control)
		}

		const layoutClass = getModifierClass(props.layout)
		const errorClass = getFlagClass(hasError, 'hasError')
		const className = buildClassName(['field', layoutClass, errorClass])

		return (
			<host shadowDom>
				<div class={className}>
					<span class='field-label' onclick={handleLabelClick}>
						{props.label}
					</span>
					{shouldShowHelp && <span class='field-help'>{props.help}</span>}
					<div class='field-control'>
						<slot ref={slotRef} onslotchange={handleSlotChange}></slot>
					</div>
					{hasError && (
						<span class='field-error' role='alert'>
							{props.error}
						</span>
					)}
				</div>
			</host>
		)
	},
	{
		props: {
			label: { type: String, value: (): string => '' },
			help: String,
			error: String,
			layout: { type: String, reflect: true, value: (): FieldLayoutT => 'stacked' }
		},
		styles: [foundationSheet, fieldSheet]
	}
)
