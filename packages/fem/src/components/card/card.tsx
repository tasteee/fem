import { c } from 'atomico'
import { buildClassName, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import type { BoxSpaceT } from '../box/box'
import cardCss from './card.css?inline'

export type CardSurfaceT = 'card' | 'inset'

const cardSheet = createStyleSheet(cardCss)

// A raised surface that groups related content. It
// is a column, so its children stack with the gap.
export const Card = c(
	(props) => {
		const surfaceClass = getModifierClass(props.surface)
		const paddingClass = `isPadding-${props.padding}`
		const gapClass = `isGap-${props.gap}`
		const className = buildClassName(['card', surfaceClass, paddingClass, gapClass])

		return (
			<host shadowDom>
				<div class={className}>
					<slot></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			surface: { type: String, reflect: true, value: (): CardSurfaceT => 'card' },
			padding: { type: String, reflect: true, value: (): BoxSpaceT => '5' },
			gap: { type: String, reflect: true, value: (): BoxSpaceT => '4' }
		},
		styles: [foundationSheet, cardSheet]
	}
)
