import { c } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import tabBarItemCss from './tab-bar-item.css?inline'

const tabBarItemSheet = createStyleSheet(tabBarItemCss)

// One destination in a fem-tab-bar: an icon over
// a short label.
export const TabBarItem = c(
	(props) => {
		const selectedClass = getFlagClass(props.selected, 'isSelected')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['tab-bar-item', selectedClass, disabledClass])
		const currentLabel = props.selected ? 'page' : undefined

		return (
			<host shadowDom>
				<button class={className} aria-current={currentLabel} disabled={props.disabled}>
					<slot name='icon'></slot>
					<span class='tab-bar-item-label'>
						<slot></slot>
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
		styles: [foundationSheet, tabBarItemSheet]
	}
)
