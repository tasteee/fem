import { c } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import textCss from './text.css?inline'

export type TextSizeT = 'caption' | 'small' | 'medium' | 'large'
export type TextWeightT = 'regular' | 'medium' | 'semibold' | 'bold'
export type TextColorT = 'strong' | 'muted' | 'accent' | 'danger' | 'success' | 'warning' | 'info'

const textSheet = createStyleSheet(textCss)

// Running text on the type scale. Numbers get the
// numeric face with the numeric flag.
export const Text = c(
	(props) => {
		const sizeClass = getModifierClass(props.size)
		const weightClass = getModifierClass(props.weight)
		const colorClass = getModifierClass(props.color)
		const numericClass = getFlagClass(props.numeric, 'isNumeric')
		const truncateClass = getFlagClass(props.truncate, 'isTruncated')
		const className = buildClassName(['text', sizeClass, weightClass, colorClass, numericClass, truncateClass])

		return (
			<host shadowDom>
				<span class={className}>
					<slot></slot>
				</span>
			</host>
		)
	},
	{
		props: {
			size: { type: String, reflect: true, value: (): TextSizeT => 'medium' },
			weight: { type: String, reflect: true, value: (): TextWeightT => 'regular' },
			color: { type: String, reflect: true, value: (): TextColorT => 'strong' },
			numeric: { type: Boolean, reflect: true },
			truncate: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, textSheet]
	}
)
