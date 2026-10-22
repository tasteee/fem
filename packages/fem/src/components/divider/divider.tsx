import { c } from 'atomico'
import { buildClassName, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import dividerCss from './divider.css?inline'

export type DividerOrientationT = 'horizontal' | 'vertical'

const dividerSheet = createStyleSheet(dividerCss)

// A divider is a filled bar on the surface scale, not
// a border. Use it between groups, never around them.
export const Divider = c(
	(props) => {
		const orientationClass = getModifierClass(props.orientation)
		const className = buildClassName(['divider', orientationClass])

		return (
			<host shadowDom>
				<span class={className} role='separator' aria-orientation={props.orientation}></span>
			</host>
		)
	},
	{
		props: {
			orientation: { type: String, reflect: true, value: (): DividerOrientationT => 'horizontal' }
		},
		styles: [foundationSheet, dividerSheet]
	}
)
