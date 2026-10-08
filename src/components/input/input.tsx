import { c, useEvent, useProp, useRef } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { focusableShadow, useFormControl } from '../../foundation/use-form-control'
import inputCss from './input.css?inline'

export type InputSizeT = 'small' | 'medium' | 'large'

const inputSheet = createStyleSheet(inputCss)

export const Input = c(
	(props) => {
		const inputRef = useRef<HTMLInputElement>()
		const [value, setValue] = useProp<string>('value')
		const [isInvalid, setInvalid] = useProp<boolean>('invalid')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const currentValue = value ?? ''
		const defaultValueRef = useRef(currentValue)
		// True only while the form marked this input
		// invalid, so typing clears that and nothing else.
		const wasMarkedByFormRef = useRef(false)
		const isMissing = Boolean(props.required) && currentValue === ''

		const internals = useFormControl({
			formValue: currentValue,
			isMissing,
			missingMessage: 'Enter a value.',
			anchorRef: inputRef,
			handleReset: () => setValue(defaultValueRef.current)
		})

		const sizeClass = getModifierClass(props.size)
		const invalidClass = getFlagClass(isInvalid, 'isInvalid')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['input', sizeClass, invalidClass, disabledClass])
		const invalidLabel = String(Boolean(isInvalid))

		// The browser fires this on the host when a
		// submit is blocked by this input.
		const handleInvalid = () => {
			wasMarkedByFormRef.current = true
			setInvalid(true)
		}

		const handleInput = (event: Event) => {
			const inputElement = event.currentTarget as HTMLInputElement
			setValue(inputElement.value)
			if (!wasMarkedByFormRef.current) return
			wasMarkedByFormRef.current = false
			setInvalid(false)
		}

		// The native change event stops at the shadow
		// root, so the host sends its own.
		const handleChange = () => dispatchChange()

		// Enter submits the form, as it does in a native
		// text input.
		const handleKeyDown = (event: KeyboardEvent) => {
			const isEnter = event.key === 'Enter'
			if (!isEnter) return
			if (internals.form) internals.form.requestSubmit()
		}

		return (
			<host shadowDom={focusableShadow} oninvalid={handleInvalid}>
				<input
					ref={inputRef}
					class={className}
					type={props.type}
					value={currentValue}
					placeholder={props.placeholder}
					disabled={props.disabled}
					aria-invalid={invalidLabel}
					aria-required={props.required}
					aria-label={props.label}
					oninput={handleInput}
					onchange={handleChange}
					onkeydown={handleKeyDown}
				/>
			</host>
		)
	},
	{
		form: true,
		props: {
			size: { type: String, reflect: true, value: (): InputSizeT => 'medium' },
			type: { type: String, reflect: true, value: (): string => 'text' },
			value: { type: String, value: (): string => '' },
			name: { type: String, reflect: true },
			placeholder: String,
			label: String,
			required: { type: Boolean, reflect: true },
			invalid: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, inputSheet]
	}
)
