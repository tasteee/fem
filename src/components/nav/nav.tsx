import { c, useEvent, useHost, useProp, useRef } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { useSelectionGroup } from '../../foundation/use-selection-group'
import { useSlidingIndicator } from '../../foundation/use-sliding-indicator'
import navCss from './nav.css?inline'

const navSheet = createStyleSheet(navCss)

// A vertical list of destinations, like a sidebar.
// The selected fill slides between items.
export const Nav = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()
		const trackRef = useRef<HTMLDivElement>()
		const indicatorRef = useRef<HTMLSpanElement>()
		const [value, setValue] = useProp<string>('value')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })
		const itemTagName = 'fem-nav-item'

		const group = useSelectionGroup({
			hostRef,
			itemTagName,
			value,
			setValue,
			dispatchChange,
			orientation: 'vertical'
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
					class='nav'
					aria-label={props.label}
					onclick={group.handleClick}
					onkeydown={group.handleKeyDown}
				>
					<span ref={indicatorRef} class='slide-indicator nav-indicator' aria-hidden='true'></span>
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
		styles: [foundationSheet, navSheet]
	}
)
