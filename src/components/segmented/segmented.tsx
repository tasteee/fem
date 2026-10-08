import { c, useEvent, useHost, useProp } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { useSelectionGroup } from '../../foundation/use-selection-group'
import segmentedCss from './segmented.css?inline'

const segmentedSheet = createStyleSheet(segmentedCss)

export const Segmented = c(
	() => {
		const hostRef = useHost<HTMLElement>()
		const [value, setValue] = useProp<string>('value')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })
		const group = useSelectionGroup({ hostRef, itemTagName: 'fem-segment', value, setValue, dispatchChange })

		return (
			<host shadowDom>
				<div class='segment-group' role='radiogroup' onclick={group.handleClick} onkeydown={group.handleKeyDown}>
					<slot onslotchange={group.syncItems}></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true, value: (): string => '' }
		},
		styles: [foundationSheet, segmentedSheet]
	}
)
