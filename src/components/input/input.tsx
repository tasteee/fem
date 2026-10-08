import { c, useEvent, useProp } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import inputCss from './input.css?inline'

export type InputSizeT = 'small' | 'medium' | 'large'

const inputSheet = createStyleSheet(inputCss)

export const Input = c(
	(props) => {
		const [value, setValue] = useProp<string>('value')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const sizeClass = getModifierClass(props.size)
		const invalidClass = getFlagClass(props.invalid, 'isInvalid')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['input', sizeClass, invalidClass, disabledClass])

		const handleInput = (event: Event) => {
			const inputElement = event.currentTarget as HTMLInputElement
			setValue(inputElement.value)
		}

		// The native change event stops at the shadow
		// root, so the host sends its own.
		const handleChange = () => dispatchChange()

		return (
			<host shadowDom>
				<input
					class={className}
					type={props.type}
					name={props.name}
					value={value}
					placeholder={props.placeholder}
					disabled={props.disabled}
					aria-invalid={props.invalid}
					aria-label={props.label}
					oninput={handleInput}
					onchange={handleChange}
				/>
			</host>
		)
	},
	{
		props: {
			size: { type: String, reflect: true, value: (): InputSizeT => 'medium' },
			type: { type: String, reflect: true, value: (): string => 'text' },
			value: { type: String, value: (): string => '' },
			name: String,
			placeholder: String,
			label: String,
			invalid: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, inputSheet]
	}
)
