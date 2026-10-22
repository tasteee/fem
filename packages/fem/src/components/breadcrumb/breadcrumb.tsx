import { c } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { caretRightIcon } from '../../icons/generated'
import breadcrumbCss from './breadcrumb.css?inline'

const breadcrumbSheet = createStyleSheet(breadcrumbCss)

// One step in a trail. The last step is the current
// page: it isn't a link and has no caret after it.
export const Breadcrumb = c(
	(props) => {
		const isCurrent = Boolean(props.current)
		const hasLink = Boolean(props.href) && !isCurrent
		const currentClass = getFlagClass(isCurrent, 'isCurrent')
		const className = buildClassName(['breadcrumb', currentClass])
		const currentLabel = isCurrent ? 'page' : undefined

		const linkContent = (
			<a class='breadcrumb-link' href={props.href}>
				<slot></slot>
			</a>
		)

		const textContent = (
			<span class='breadcrumb-link' aria-current={currentLabel}>
				<slot></slot>
			</span>
		)

		const content = hasLink ? linkContent : textContent
		const separator = isCurrent ? null : <IconSvg icon={caretRightIcon} kind='bold' />

		return (
			<host shadowDom role='listitem'>
				<span class={className}>
					{content}
					{separator}
				</span>
			</host>
		)
	},
	{
		props: {
			href: String,
			current: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, breadcrumbSheet]
	}
)
