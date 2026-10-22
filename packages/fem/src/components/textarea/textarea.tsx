import { c, useEffect, useEvent, useProp, useRef } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { focusableShadow, useFormControl } from '../../foundation/use-form-control'
import textareaCss from './textarea.css?inline'

const textareaSheet = createStyleSheet(textareaCss)

// Grows the box to fit its text, so long bios never
// hide behind a scrollbar.
const fitToContent = (textareaElement: HTMLTextAreaElement) => {
	textareaElement.style.height = 'auto'
	textareaElement.style.height = `${textareaElement.scrollHeight}px`
}

// Several lines of text. Add autosize to grow with the
// text, and maxlength to show a count.
export const Textarea = c(
	(props) => {
		const textareaRef = useRef<HTMLTextAreaElement>()
		const [value, setValue] = useProp<string>('value')
		const [isInvalid, setInvalid] = useProp<boolean>('invalid')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const currentValue = value ?? ''
		const defaultValueRef = useRef(currentValue)
		const wasMarkedByFormRef = useRef(false)
		const isMissing = Boolean(props.required) && currentValue === ''

		useFormControl({
			formValue: currentValue,
			isMissing,
			missingMessage: 'Enter a value.',
			anchorRef: textareaRef,
			handleReset: () => setValue(defaultValueRef.current)
		})

		// Fits again when the value changes from outside,
		// like a form reset or a loaded profile.
		useEffect(() => {
			const textareaElement = textareaRef.current
			const shouldFit = props.autosize && textareaElement
			if (!shouldFit) return
			fitToContent(textareaElement)
		}, [currentValue, props.autosize])

		const hasLimit = props.maxlength > 0
		const isNearLimit = currentValue.length > props.maxlength * 0.9
		const counterClass = buildClassName(['textarea-counter', getFlagClass(isNearLimit, 'isNearLimit')])
		const counterText = `${currentValue.length} / ${props.maxlength}`
		const counter = <span class={counterClass}>{counterText}</span>
		const maybeCounter = hasLimit ? counter : null
		const limitValue = hasLimit ? props.maxlength : null

		const invalidClass = getFlagClass(isInvalid, 'isInvalid')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const autosizeClass = getFlagClass(props.autosize, 'isAutosize')
		const className = buildClassName(['textarea', invalidClass, disabledClass, autosizeClass])
		const invalidLabel = String(Boolean(isInvalid))

		const handleInvalid = () => {
			wasMarkedByFormRef.current = true
			setInvalid(true)
		}

		const handleInput = (event: Event) => {
			const textareaElement = event.currentTarget as HTMLTextAreaElement
			setValue(textareaElement.value)
			if (!wasMarkedByFormRef.current) return
			wasMarkedByFormRef.current = false
			setInvalid(false)
		}

		const handleChange = () => dispatchChange()

		return (
			<host shadowDom={focusableShadow} oninvalid={handleInvalid}>
				<div class='textarea-frame'>
					<textarea
						ref={textareaRef}
						class={className}
						value={currentValue}
						rows={props.rows}
						maxLength={limitValue}
						placeholder={props.placeholder}
						disabled={props.disabled}
						aria-invalid={invalidLabel}
						aria-required={props.required}
						aria-label={props.label}
						oninput={handleInput}
						onchange={handleChange}
					></textarea>
					{maybeCounter}
				</div>
			</host>
		)
	},
	{
		form: true,
		props: {
			value: { type: String, value: (): string => '' },
			name: { type: String, reflect: true },
			placeholder: String,
			label: String,
			rows: { type: Number, value: (): number => 3 },
			maxlength: { type: Number, value: (): number => 0 },
			autosize: { type: Boolean, reflect: true },
			required: { type: Boolean, reflect: true },
			invalid: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, textareaSheet]
	}
)
