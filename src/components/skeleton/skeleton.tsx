import { c } from 'atomico'
import { buildClassName, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import skeletonCss from './skeleton.css?inline'

export type SkeletonShapeT = 'text' | 'box' | 'circle'

const skeletonSheet = createStyleSheet(skeletonCss)

// The last line of a text block is shorter, like a
// real paragraph.
const buildLineIndexes = (lineCount: number): number[] => {
	const safeLineCount = Math.max(1, lineCount)
	return Array.from({ length: safeLineCount }, (_, lineIndex) => lineIndex)
}

// A flat placeholder that pulses while content loads.
// No shimmer gradient: fem stays flat.
export const Skeleton = c(
	(props) => {
		const shapeClass = getModifierClass(props.shape)
		const isText = props.shape === 'text'
		const lineIndexes = buildLineIndexes(props.lines)
		const hasWidth = Boolean(props.width)
		const hasHeight = Boolean(props.height)
		const widthStyle = hasWidth ? `--skeleton-width: ${props.width};` : ''
		const heightStyle = hasHeight ? `--skeleton-height: ${props.height};` : ''
		// Sizes are data from the app, so they ride in
		// as custom properties.
		const sizeStyle = `${widthStyle}${heightStyle}`

		if (isText) {
			return (
				<host shadowDom aria-hidden='true'>
					<span class='skeleton-lines' style={sizeStyle}>
						{lineIndexes.map((lineIndex) => (
							<span key={lineIndex} class='skeleton isText'></span>
						))}
					</span>
				</host>
			)
		}

		const className = buildClassName(['skeleton', shapeClass])

		return (
			<host shadowDom aria-hidden='true'>
				<span class={className} style={sizeStyle}></span>
			</host>
		)
	},
	{
		props: {
			shape: { type: String, reflect: true, value: (): SkeletonShapeT => 'text' },
			lines: { type: Number, reflect: true, value: (): number => 1 },
			width: String,
			height: String
		},
		styles: [foundationSheet, skeletonSheet]
	}
)
