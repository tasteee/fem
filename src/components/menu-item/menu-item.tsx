import { c } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import menuItemCss from './menu-item.css?inline'

export type MenuItemColorT = 'neutral' | 'danger'

const menuItemSheet = createStyleSheet(menuItemCss)

export const MenuItem = c(
	(props) => {
		const colorClass = getModifierClass(props.color)
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['floating-row', colorClass, disabledClass])

		return (
			<host shadowDom>
				<button class={className} role='menuitem' disabled={props.disabled}>
					<slot></slot>
				</button>
			</host>
		)
	},
	{
		props: {
			color: { type: String, reflect: true, value: (): MenuItemColorT => 'neutral' },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, menuItemSheet]
	}
)
