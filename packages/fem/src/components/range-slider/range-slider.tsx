import { c, useEvent, useProp, useRef } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { focusableShadow, useFormControl } from '../../foundation/use-form-control'
import rangeSliderCss from './range-slider.css?inline'

const rangeSliderSheet = createStyleSheet(rangeSliderCss)

const getRatio = (value: number, minimum: number, maximum: number): number => {
	const range = maximum - minimum
	const hasRange = range > 0
	if (!hasRange) return 0
	const ratio = (value - minimum) / range
	return Math.min(1, Math.max(0, ratio))
}

// Two thumbs on one track, for a span like a BPM
// range. Each thumb is a real range input, so touch,
// drag, and the keyboard all work natively. The
// thumbs can't cross.
export const RangeSlider = c(
	(props) => {
		const [start, setStart] = useProp<number>('start')
		const [end, setEnd] = useProp<number>('end')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const startInputRef = useRef<HTMLInputElement>()
		const currentStart = start ?? props.min
		const currentEnd = end ?? props.max
		const defaultStartRef = useRef(currentStart)
		const defaultEndRef = useRef(currentEnd)

		const handleReset = () => {
			setStart(defaultStartRef.current)
			setEnd(defaultEndRef.current)
		}

		// Sends one value, like "90,140".
		const formValue = `${currentStart},${currentEnd}`

		useFormControl({
			formValue,
			isMissing: false,
			missingMessage: '',
			anchorRef: startInputRef,
			handleReset
		})

		const startRatio = getRatio(currentStart, props.min, props.max)
		const endRatio = getRatio(currentEnd, props.min, props.max)
		const ratioStyle = `--range-start: ${startRatio}; --range-end: ${endRatio}`
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['range-slider', disabledClass])
		const baseLabel = props.label ?? 'Range'
		const startLabel = `${baseLabel} start`
		const endLabel = `${baseLabel} end`
		const valueText = `${currentStart}–${currentEnd}`
		const valueLabel = props.showValue ? <span class='range-slider-value'>{valueText}</span> : null

		const handleStartInput = (event: Event) => {
			const inputElement = event.currentTarget as HTMLInputElement
			const nextStart = Math.min(Number(inputElement.value), currentEnd)
			inputElement.value = String(nextStart)
			setStart(nextStart)
		}

		const handleEndInput = (event: Event) => {
			const inputElement = event.currentTarget as HTMLInputElement
			const nextEnd = Math.max(Number(inputElement.value), currentStart)
			inputElement.value = String(nextEnd)
			setEnd(nextEnd)
		}

		const handleChange = () => dispatchChange()

		return (
			<host shadowDom={focusableShadow}>
				<div class='range-slider-row'>
					<div class={className} style={ratioStyle}>
						<span class='range-slider-track'>
							<span class='range-slider-fill'></span>
						</span>
						<input
							ref={startInputRef}
							class='range-slider-input'
							type='range'
							min={props.min}
							max={props.max}
							step={props.step}
							value={currentStart}
							disabled={props.disabled}
							aria-label={startLabel}
							oninput={handleStartInput}
							onchange={handleChange}
						/>
						<input
							class='range-slider-input'
							type='range'
							min={props.min}
							max={props.max}
							step={props.step}
							value={currentEnd}
							disabled={props.disabled}
							aria-label={endLabel}
							oninput={handleEndInput}
							onchange={handleChange}
						/>
						<span class='range-slider-thumb isStart'></span>
						<span class='range-slider-thumb isEnd'></span>
					</div>
					{valueLabel}
				</div>
			</host>
		)
	},
	{
		form: true,
		props: {
			name: { type: String, reflect: true },
			start: { type: Number, reflect: true, value: (): number => 0 },
			end: { type: Number, reflect: true, value: (): number => 100 },
			min: { type: Number, value: (): number => 0 },
			max: { type: Number, value: (): number => 100 },
			step: { type: Number, value: (): number => 1 },
			label: String,
			showValue: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, rangeSliderSheet]
	}
)
