import { c, useEvent, useProp } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import sliderCss from './slider.css?inline'

const sliderSheet = createStyleSheet(sliderCss)

const getFillRatio = (value: number, minimum: number, maximum: number): number => {
	const range = maximum - minimum
	const hasRange = range > 0
	if (!hasRange) return 0
	const ratio = (value - minimum) / range
	return Math.min(1, Math.max(0, ratio))
}

export const Slider = c(
	(props) => {
		const [value, setValue] = useProp<number>('value')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const currentValue = value ?? props.min
		const fillRatio = getFillRatio(currentValue, props.min, props.max)
		const ratioStyle = `--slider-ratio: ${fillRatio}`
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['slider', disabledClass])

		const handleInput = (event: Event) => {
			const inputElement = event.currentTarget as HTMLInputElement
			setValue(Number(inputElement.value))
		}

		// The native change event stops at the shadow
		// root, so the host sends its own.
		const handleChange = () => dispatchChange()

		return (
			<host shadowDom>
				<div class={className} style={ratioStyle}>
					<span class='slider-track'>
						<span class='slider-fill'></span>
					</span>
					<input
						class='slider-input'
						type='range'
						min={props.min}
						max={props.max}
						step={props.step}
						value={currentValue}
						disabled={props.disabled}
						aria-label={props.label}
						oninput={handleInput}
						onchange={handleChange}
					/>
					<span class='slider-thumb'></span>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: Number, reflect: true, value: (): number => 0 },
			min: { type: Number, value: (): number => 0 },
			max: { type: Number, value: (): number => 100 },
			step: { type: Number, value: (): number => 1 },
			label: String,
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, sliderSheet]
	}
)
