import { c } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import tabCss from './tab.css?inline'

const tabSheet = createStyleSheet(tabCss)

export const Tab = c(
	(props) => {
		const selectedClass = getFlagClass(props.selected, 'isSelected')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['tab', selectedClass, disabledClass])
		const selectedLabel = String(Boolean(props.selected))

		return (
			<host shadowDom>
				<button class={className} role='tab' aria-selected={selectedLabel} disabled={props.disabled}>
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
		styles: [foundationSheet, tabSheet]
	}
)
