import { c } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import optionCss from './option.css?inline'

const optionSheet = createStyleSheet(optionCss)

export const Option = c(
	(props) => {
		const selectedClass = getFlagClass(props.selected, 'isSelected')
		const activeClass = getFlagClass(props.active, 'isActive')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['floating-row', selectedClass, activeClass, disabledClass])
		const selectedLabel = String(Boolean(props.selected))

		return (
			<host shadowDom>
				<button class={className} role='option' aria-selected={selectedLabel} disabled={props.disabled}>
					<slot></slot>
				</button>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true, value: (): string => '' },
			selected: { type: Boolean, reflect: true },
			// Set by a combobox while the arrow keys rest on
			// this option, since focus stays in its input.
			active: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, optionSheet]
	}
)
