import { c, useEvent, useHost, useProp, useRef } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { useSelectionGroup } from '../../foundation/use-selection-group'
import { useSlidingIndicator } from '../../foundation/use-sliding-indicator'
import tabBarCss from './tab-bar.css?inline'

const tabBarSheet = createStyleSheet(tabBarCss)

// The bottom bar of a mobile app. A few top-level
// destinations, each an icon over a short label.
export const TabBar = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()
		const trackRef = useRef<HTMLDivElement>()
		const indicatorRef = useRef<HTMLSpanElement>()
		const [value, setValue] = useProp<string>('value')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })
		const itemTagName = 'fem-tab-bar-item'

		const group = useSelectionGroup({
			hostRef,
			itemTagName,
			value,
			setValue,
			dispatchChange,
			orientation: 'horizontal'
		})

		const slide = useSlidingIndicator({ hostRef, trackRef, indicatorRef, itemTagName, value })

		const handleSlotChange = () => {
			group.syncItems()
			slide.handleItemsChange()
		}

		return (
			<host shadowDom>
				<nav
					ref={trackRef}
					class='tab-bar'
					aria-label={props.label}
					onclick={group.handleClick}
					onkeydown={group.handleKeyDown}
				>
					<span ref={indicatorRef} class='slide-indicator tab-bar-indicator' aria-hidden='true'></span>
					<slot onslotchange={handleSlotChange}></slot>
				</nav>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true, value: (): string => '' },
			label: String
		},
		styles: [foundationSheet, tabBarSheet]
	}
)
