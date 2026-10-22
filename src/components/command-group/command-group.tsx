import { c } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import commandGroupCss from './command-group.css?inline'

const commandGroupSheet = createStyleSheet(commandGroupCss)

// A labeled set of commands. The palette hides a group
// when a search leaves nothing in it.
export const CommandGroup = c(
	(props) => {
		return (
			<host shadowDom>
				<div class='command-group' role='group' aria-label={props.heading}>
					<span class='command-group-heading' aria-hidden='true'>
						{props.heading}
					</span>
					<slot></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			heading: { type: String, value: (): string => '' }
		},
		styles: [foundationSheet, commandGroupSheet]
	}
)
