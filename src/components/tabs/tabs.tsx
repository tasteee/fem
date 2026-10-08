import { c, useEvent, useHost, useProp } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { useSelectionGroup } from '../../foundation/use-selection-group'
import tabsCss from './tabs.css?inline'

const tabsSheet = createStyleSheet(tabsCss)

export const Tabs = c(
	() => {
		const hostRef = useHost<HTMLElement>()
		const [value, setValue] = useProp<string>('value')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })
		const group = useSelectionGroup({ hostRef, itemTagName: 'fem-tab', value, setValue, dispatchChange })

		return (
			<host shadowDom>
				<div class='tab-list' role='tablist' onclick={group.handleClick} onkeydown={group.handleKeyDown}>
					<slot onslotchange={group.syncItems}></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true, value: (): string => '' }
		},
		styles: [foundationSheet, tabsSheet]
	}
)
