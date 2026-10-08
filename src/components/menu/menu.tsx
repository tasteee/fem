import { c, useEffect, useHost, useProp, useRef } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { focusItem, getEnabledItems, handleRovingKeyDown } from '../../foundation/roving-focus'
import { useFloatingPopover } from '../../foundation/use-floating-popover'
import menuCss from './menu.css?inline'

const menuSheet = createStyleSheet(menuCss)

const checkIsMenuItem = (target: EventTarget): boolean => {
	return target instanceof HTMLElement && target.localName === 'fem-menu-item'
}

export const Menu = c(
	() => {
		const hostRef = useHost<HTMLElement>()
		const anchorRef = useRef<HTMLSpanElement>()
		const panelRef = useRef<HTMLDivElement>()
		const wasOpenOnPressRef = useRef(false)
		const [isOpen, setOpen] = useProp<boolean>('open')
		const isPanelOpen = Boolean(isOpen)

		useFloatingPopover(anchorRef, panelRef, isPanelOpen, { placement: 'below', alignment: 'start' })

		// Opening moves focus to the first item, so the
		// arrow keys work right away.
		useEffect(() => {
			if (!isPanelOpen) return
			const enabledItems = getEnabledItems(hostRef.current, 'fem-menu-item')
			focusItem(enabledItems[0])
		}, [isPanelOpen])

		const handleKeyDown = (event: KeyboardEvent) => {
			const enabledItems = getEnabledItems(hostRef.current, 'fem-menu-item')
			handleRovingKeyDown(event, enabledItems, 'vertical')
		}

		// The browser closes the menu on an outside press
		// or Escape, so the open flag follows it.
		const handleToggle = (event: Event) => {
			const toggleEvent = event as ToggleEvent
			const isNowOpen = toggleEvent.newState === 'open'
			setOpen(isNowOpen)
		}

		// A press on the trigger while the menu is open
		// closes it first. Without this the click that
		// follows would open it again.
		const handleTriggerPress = () => (wasOpenOnPressRef.current = isPanelOpen)

		const handleTriggerClick = () => {
			if (wasOpenOnPressRef.current) return
			setOpen(true)
		}

		const handlePanelClick = (event: Event) => {
			const clickedItem = event.composedPath().find(checkIsMenuItem)
			if (clickedItem) setOpen(false)
		}

		return (
			<host shadowDom>
				<span ref={anchorRef} class='menu-anchor' onpointerdown={handleTriggerPress} onclick={handleTriggerClick}>
					<slot name='trigger'></slot>
				</span>

				<div
					ref={panelRef}
					class='floating-panel'
					popover='auto'
					role='menu'
					onclick={handlePanelClick}
					onkeydown={handleKeyDown}
					ontoggle={handleToggle}
				>
					<slot></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			open: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, menuSheet]
	}
)
