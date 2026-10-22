import { c } from 'atomico'
import { buildClassName } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import type { BoxSpaceT } from '../box/box'
import gridCss from './grid.css?inline'

const gridSheet = createStyleSheet(gridCss)

// Two ways to size columns. A fixed count, or a
// minimum width that fits as many columns as the
// space allows. Minimum wins when both are set.
const getTrackTemplate = (columns: number, minimumWidth: string | undefined): string => {
	const hasMinimumWidth = Boolean(minimumWidth)
	if (hasMinimumWidth) return `repeat(auto-fill, minmax(min(${minimumWidth}, 100%), 1fr))`
	return `repeat(${columns}, minmax(0, 1fr))`
}

// A grid of equal columns, by count or by minimum
// column width.
export const Grid = c(
	(props) => {
		const trackTemplate = getTrackTemplate(props.columns, props.min)
		const gapClass = `isGap-${props.gap}`
		const className = buildClassName(['grid', gapClass])
		// The track count is data, not a style choice,
		// so it rides in as a custom property.
		const gridStyle = `--grid-tracks: ${trackTemplate}`

		return (
			<host shadowDom>
				<div class={className} style={gridStyle}>
					<slot></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			columns: { type: Number, reflect: true, value: (): number => 2 },
			min: { type: String, reflect: true },
			gap: { type: String, reflect: true, value: (): BoxSpaceT => '4' }
		},
		styles: [foundationSheet, gridSheet]
	}
)
