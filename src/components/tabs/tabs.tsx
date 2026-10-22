import { c, useEvent, useHost, useProp, useRef } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { useSelectionGroup } from '../../foundation/use-selection-group'
import { useSlidingIndicator } from '../../foundation/use-sliding-indicator'
import tabsCss from './tabs.css?inline'

const tabsSheet = createStyleSheet(tabsCss)

// Switches between views. The underline slides.
export const Tabs = c(
	() => {
		const hostRef = useHost<HTMLElement>()
		const trackRef = useRef<HTMLDivElement>()
		const indicatorRef = useRef<HTMLSpanElement>()
		const [value, setValue] = useProp<string>('value')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })
		const group = useSelectionGroup({ hostRef, itemTagName: 'fem-tab', value, setValue, dispatchChange })

		const slide = useSlidingIndicator({ hostRef, trackRef, indicatorRef, itemTagName: 'fem-tab', value })

		const handleSlotChange = () => {
			group.syncItems()
			slide.handleItemsChange()
		}

		return (
			<host shadowDom>
				<div ref={trackRef} class='tab-list' role='tablist' onclick={group.handleClick} onkeydown={group.handleKeyDown}>
					<slot onslotchange={handleSlotChange}></slot>
					<span ref={indicatorRef} class='slide-indicator tab-indicator' aria-hidden='true'></span>
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
