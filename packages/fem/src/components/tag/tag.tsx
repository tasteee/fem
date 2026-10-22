import { c, useEvent } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { xIcon } from '../../icons/generated'
import tagCss from './tag.css?inline'

const tagSheet = createStyleSheet(tagCss)

// A small label. With removable, it gets an x that
// sends a remove event. The app decides what to do.
export const Tag = c(
	(props) => {
		const dispatchRemove = useEvent('remove', { bubbles: true, composed: true })
		const handleRemoveClick = () => dispatchRemove()

		const removeButton = props.removable ? (
			<button class='tag-remove' aria-label='Remove' onclick={handleRemoveClick}>
				<IconSvg icon={xIcon} kind='bold' />
			</button>
		) : null

		return (
			<host shadowDom>
				<span class='tag'>
					<slot></slot>
					{removeButton}
				</span>
			</host>
		)
	},
	{
		props: {
			removable: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, tagSheet]
	}
)
