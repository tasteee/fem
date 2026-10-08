import { c } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import progressCss from './progress.css?inline'

const progressSheet = createStyleSheet(progressCss)

const getProgressRatio = (value: number, maximum: number): number => {
	const hasMaximum = maximum > 0
	if (!hasMaximum) return 0
	const ratio = value / maximum
	return Math.min(1, Math.max(0, ratio))
}

export const Progress = c(
	(props) => {
		const progressRatio = getProgressRatio(props.value, props.max)
		const ratioStyle = `--progress-ratio: ${progressRatio}`

		return (
			<host shadowDom>
				<div
					class='progress'
					style={ratioStyle}
					role='progressbar'
					aria-label={props.label}
					aria-valuemin={0}
					aria-valuemax={props.max}
					aria-valuenow={props.value}
				>
					<span class='progress-fill'></span>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: Number, reflect: true, value: (): number => 0 },
			max: { type: Number, value: (): number => 100 },
			label: String
		},
		styles: [foundationSheet, progressSheet]
	}
)
