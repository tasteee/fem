import { c } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import tagCss from './tag.css?inline'

const tagSheet = createStyleSheet(tagCss)

export const Tag = c(
	() => {
		return (
			<host shadowDom>
				<span class='tag'>
					<slot></slot>
				</span>
			</host>
		)
	},
	{ styles: [foundationSheet, tagSheet] }
)
