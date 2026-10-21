import { c } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import navItemCss from './nav-item.css?inline'

const navItemSheet = createStyleSheet(navItemCss)

// One destination in a fem-nav: an icon, a label,
// and an optional end slot for a count or badge.
export const NavItem = c(
	(props) => {
		const selectedClass = getFlagClass(props.selected, 'isSelected')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['nav-item', selectedClass, disabledClass])
		const currentLabel = props.selected ? 'page' : undefined

		return (
			<host shadowDom>
				<button class={className} aria-current={currentLabel} disabled={props.disabled}>
					<slot name='icon'></slot>
					<span class='nav-item-label'>
						<slot></slot>
					</span>
					<span class='nav-item-end'>
						<slot name='end'></slot>
					</span>
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
		styles: [foundationSheet, navItemSheet]
	}
)
