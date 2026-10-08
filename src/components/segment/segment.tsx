import { c } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import segmentCss from './segment.css?inline'

const segmentSheet = createStyleSheet(segmentCss)

export const Segment = c(
	(props) => {
		const selectedClass = getFlagClass(props.selected, 'isSelected')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['segment', selectedClass, disabledClass])
		const checkedLabel = String(Boolean(props.selected))

		return (
			<host shadowDom>
				<button class={className} role='radio' aria-checked={checkedLabel} disabled={props.disabled}>
					<slot></slot>
				</button>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true, value: (): string => '' },
			selected: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, segmentSheet]
	}
)
