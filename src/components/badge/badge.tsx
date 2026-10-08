import { c } from 'atomico'
import { buildClassName, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import badgeCss from './badge.css?inline'

export type BadgeColorT = 'neutral' | 'accent' | 'danger' | 'success' | 'warning' | 'info'

const badgeSheet = createStyleSheet(badgeCss)

export const Badge = c(
	(props) => {
		const colorClass = getModifierClass(props.color)
		const className = buildClassName(['badge', colorClass])

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
			color: { type: String, reflect: true, value: (): BadgeColorT => 'neutral' }
		},
		styles: [foundationSheet, badgeSheet]
	}
)
