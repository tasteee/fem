import { c } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import emptyStateCss from './empty-state.css?inline'

const emptyStateSheet = createStyleSheet(emptyStateCss)

// What a screen shows when there's nothing in it yet:
// an icon, a heading that names what's missing, one
// line on how to add it, and the action that does.
export const EmptyState = c(
	(props) => {
		return (
			<host shadowDom>
				<div class='empty-state'>
					<span class='empty-state-icon'>
						<slot name='icon'></slot>
					</span>
					<div class='empty-state-text'>
						<span class='empty-state-heading' role='heading' aria-level='3'>
							{props.heading}
						</span>
						<span class='empty-state-description'>
							<slot></slot>
						</span>
					</div>
					<div class='empty-state-actions'>
						<slot name='actions'></slot>
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			heading: { type: String, value: (): string => '' }
		},
		styles: [foundationSheet, emptyStateSheet]
	}
)
