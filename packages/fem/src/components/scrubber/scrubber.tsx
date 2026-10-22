import { c, useEvent, useProp, useState } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { formatDuration } from '../../foundation/format-duration'
import { foundationSheet } from '../../foundation/foundation-sheet'
import scrubberCss from './scrubber.css?inline'

export type ScrubberTimeT = 'none' | 'sides' | 'below'

type SeekDetailT = {
	value: number
}

const scrubberSheet = createStyleSheet(scrubberCss)
const arrowStepSeconds = 5

const getRatio = (value: number, maximum: number): number => {
	const hasLength = maximum > 0
	if (!hasLength) return 0
	return Math.min(1, Math.max(0, value / maximum))
}

const clampSeconds = (value: number, maximum: number): number => Math.min(maximum, Math.max(0, value))

type TimePropsT = {
	elapsed: number
	total: number
	showRemaining: boolean
}

const ElapsedTime = (props: TimePropsT) => {
	const elapsedText = formatDuration(props.elapsed)
	return <span class='scrubber-time isElapsed'>{elapsedText}</span>
}

const EndTime = (props: TimePropsT) => {
	const remainingSeconds = props.total - props.elapsed
	const remainingText = `-${formatDuration(remainingSeconds)}`
	const totalText = formatDuration(props.total)
	const endText = props.showRemaining ? remainingText : totalText
	return <span class='scrubber-time isEnd'>{endText}</span>
}

// A seek bar for audio and video. It keeps its own
// position while dragged, so playback updates never
// yank the thumb out from under a finger.
export const Scrubber = c(
	(props) => {
		const [value, setValue] = useProp<number>('value')
		const [dragValue, setDragValue] = useState<number | null>(null)
		const dispatchInput = useEvent<SeekDetailT>('input', { bubbles: true, composed: true })
		const dispatchChange = useEvent<SeekDetailT>('change', { bubbles: true, composed: true })

		const isDragging = dragValue !== null
		const playbackValue = value ?? 0
		const shownValue = isDragging ? dragValue : playbackValue
		const fillRatio = getRatio(shownValue, props.max)
		const bufferedRatio = getRatio(props.buffered, props.max)
		const ratioStyle = `--scrubber-ratio: ${fillRatio}; --scrubber-buffered: ${bufferedRatio}`

		const commitSeek = (seconds: number) => {
			setDragValue(null)
			setValue(seconds)
			dispatchChange({ value: seconds })
		}

		// The native input event would leave the shadow
		// root bare. The host sends one with the value.
		const handleInput = (event: Event) => {
			event.stopPropagation()
			const inputElement = event.currentTarget as HTMLInputElement
			const seconds = Number(inputElement.value)
			setDragValue(seconds)
			dispatchInput({ value: seconds })
		}

		const handleChange = (event: Event) => {
			const inputElement = event.currentTarget as HTMLInputElement
			commitSeek(Number(inputElement.value))
		}

		// Arrows jump five seconds, like most players,
		// instead of the native one.
		const handleKeyDown = (event: KeyboardEvent) => {
			const isBack = event.key === 'ArrowLeft' || event.key === 'ArrowDown'
			const isForward = event.key === 'ArrowRight' || event.key === 'ArrowUp'
			const isArrow = isBack || isForward
			if (!isArrow) return
			event.preventDefault()
			const direction = isForward ? 1 : -1
			const nextSeconds = clampSeconds(playbackValue + direction * arrowStepSeconds, props.max)
			commitSeek(nextSeconds)
		}

		const timeClass = getModifierClass(props.time)
		const draggingClass = getFlagClass(isDragging, 'isDragging')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['scrubber', timeClass, draggingClass, disabledClass])
		const valueText = `${formatDuration(shownValue)} of ${formatDuration(props.max)}`

		const hasTime = props.time !== 'none'
		const showRemaining = Boolean(props.showRemaining)
		const elapsed = <ElapsedTime elapsed={shownValue} total={props.max} showRemaining={showRemaining} />
		const end = <EndTime elapsed={shownValue} total={props.max} showRemaining={showRemaining} />
		const maybeElapsed = hasTime ? elapsed : null
		const maybeEnd = hasTime ? end : null

		return (
			<host shadowDom>
				<div class={className} style={ratioStyle}>
					<span class='scrubber-bar'>
						<span class='scrubber-track'>
							<span class='scrubber-buffered'></span>
							<span class='scrubber-fill'></span>
						</span>
						<input
							class='scrubber-input'
							type='range'
							min='0'
							max={props.max}
							step='any'
							value={shownValue}
							disabled={props.disabled}
							aria-label={props.label}
							aria-valuetext={valueText}
							oninput={handleInput}
							onchange={handleChange}
							onkeydown={handleKeyDown}
						/>
						<span class='scrubber-thumb'></span>
					</span>
					{maybeElapsed}
					{maybeEnd}
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: Number, value: (): number => 0 },
			max: { type: Number, value: (): number => 0 },
			buffered: { type: Number, value: (): number => 0 },
			label: { type: String, value: (): string => 'Seek' },
			time: { type: String, reflect: true, value: (): ScrubberTimeT => 'none' },
			showRemaining: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, scrubberSheet]
	}
)
