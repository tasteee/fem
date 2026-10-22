import { c } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import commandItemCss from './command-item.css?inline'

const commandItemSheet = createStyleSheet(commandItemCss)

// One command in a fem-command-palette: an icon, a
// label, and an optional shortcut hint. Keywords help
// it match searches its label doesn't cover.
export const CommandItem = c(
	(props) => {
		const activeClass = getFlagClass(props.active, 'isActive')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['command-item', activeClass, disabledClass])
		const selectedLabel = String(Boolean(props.active))

		return (
			<host shadowDom>
				<div class={className} role='option' aria-selected={selectedLabel} aria-disabled={props.disabled}>
					<slot name='icon'></slot>
					<span class='command-item-label'>
						<slot></slot>
					</span>
					<span class='command-item-shortcut'>
						<slot name='shortcut'></slot>
					</span>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true, value: (): string => '' },
			keywords: { type: String, value: (): string => '' },
			// Set by the palette while the arrow keys or the
			// pointer rest on this command.
			active: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, commandItemSheet]
	}
)
