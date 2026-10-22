import { c, useEffect, useEvent, useHost, useProp, useRef } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { useSelectionGroup } from '../../foundation/use-selection-group'
import { useSlidingIndicator } from '../../foundation/use-sliding-indicator'
import navCss from './nav.css?inline'

type NavItemElementT = HTMLElement & { collapsed: boolean }

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

		// Collapsed shows icons only. Each item hears it
		// through its own collapsed flag.
		const syncCollapsed = () => {
			const items = [...hostRef.current.querySelectorAll<NavItemElementT>(itemTagName)]
			for (const item of items) item.collapsed = Boolean(props.collapsed)
		}

		useEffect(syncCollapsed, [props.collapsed])

		const handleSlotChange = () => {
			group.syncItems()
			syncCollapsed()
			slide.handleItemsChange()
		}

		const collapsedClass = getFlagClass(props.collapsed, 'isCollapsed')
		const navClassName = buildClassName(['nav', collapsedClass])

		return (
			<host shadowDom>
				<nav
					ref={trackRef}
					class={navClassName}
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
			label: String,
			collapsed: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, navSheet]
	}
)
