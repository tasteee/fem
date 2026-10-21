import { c, useHost } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import navItemCss from './nav-item.css?inline'

const navItemSheet = createStyleSheet(navItemCss)

// The label is the unslotted content. Icons and the
// end slot are left out.
const getLabelText = (hostElement: HTMLElement | undefined): string => {
	if (!hostElement) return ''
	const labelNodes = [...hostElement.childNodes].filter((node) => {
		const isElement = node instanceof Element
		if (!isElement) return true
		return !node.hasAttribute('slot')
	})
	const labelText = labelNodes.map((node) => node.textContent ?? '').join('')
	return labelText.trim()
}

// One destination in a fem-nav: an icon, a label,
// and an optional end slot for a count or badge.
export const NavItem = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()
		const selectedClass = getFlagClass(props.selected, 'isSelected')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const collapsedClass = getFlagClass(props.collapsed, 'isCollapsed')
		const className = buildClassName(['nav-item', selectedClass, collapsedClass, disabledClass])
		const currentLabel = props.selected ? 'page' : undefined
		const itemText = getLabelText(hostRef.current)
		// Collapsed hides the label, so it moves into the
		// accessible name and the hover title.
		const collapsedLabel = props.collapsed ? itemText : undefined

		return (
			<host shadowDom>
				<button
					class={className}
					aria-current={currentLabel}
					aria-label={collapsedLabel}
					title={collapsedLabel}
					disabled={props.disabled}
				>
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
			// Set by fem-nav. Shows the icon only.
			collapsed: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, navItemSheet]
	}
)
