import { c } from 'atomico'
import { buildClassName, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import bannerCss from './banner.css?inline'

export type BannerColorT = 'info' | 'success' | 'warning' | 'danger' | 'neutral'

const bannerSheet = createStyleSheet(bannerCss)

export const Banner = c(
	(props) => {
		const colorClass = getModifierClass(props.color)
		const className = buildClassName(['banner', colorClass])
		const isUrgent = props.color === 'danger'
		const role = isUrgent ? 'alert' : 'status'

		return (
			<host shadowDom>
				<div class={className} role={role}>
					<slot></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			color: { type: String, reflect: true, value: (): BannerColorT => 'info' }
		},
		styles: [foundationSheet, bannerSheet]
	}
)
