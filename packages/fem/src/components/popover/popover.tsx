import { c, useEffect, useProp, useRef } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { getEffectiveTheme } from '../../foundation/get-effective-theme'
import { useFloatingPopover } from '../../foundation/use-floating-popover'
import type { FloatingAlignmentT, FloatingPlacementT } from '../../foundation/position-floating'
import popoverCss from './popover.css?inline'

const popoverSheet = createStyleSheet(popoverCss)

// A floating panel for any content: a short form, a
// color picker, details. Like menus, it opens in the
// inverse theme, so it stands off the page with no
// shadow. Every fem component inside flips with it.
export const Popover = c(
	(props) => {
		const anchorRef = useRef<HTMLSpanElement>()
		const panelRef = useRef<HTMLDivElement>()
		const wasOpenOnPressRef = useRef(false)
		const [isOpen, setOpen] = useProp<boolean>('open')
		const isPanelOpen = Boolean(isOpen)

		const placement = props.placement as FloatingPlacementT
		const alignment = props.alignment as FloatingAlignmentT
		useFloatingPopover(anchorRef, panelRef, isPanelOpen, { placement, alignment })

		// It is a dialog, so opening moves focus into it.
		// Tab then reaches its first control, and closing
		// sends focus back to the trigger.
		useEffect(() => {
			if (isPanelOpen) panelRef.current?.focus()
		}, [isPanelOpen])

		const anchorElement = anchorRef.current
		const pageTheme = anchorElement ? getEffectiveTheme(anchorElement) : 'light'
		const isPageLight = pageTheme === 'light'
		const darkPanelClass = getFlagClass(isPageLight, 'isDark')
		const lightPanelClass = getFlagClass(!isPageLight, 'isLight')
		const panelClassName = buildClassName(['popover-panel', darkPanelClass, lightPanelClass])

		// The browser closes the panel on an outside press
		// or Escape, so the open flag follows it.
		const handleToggle = (event: Event) => {
			const toggleEvent = event as ToggleEvent
			const isNowOpen = toggleEvent.newState === 'open'
			setOpen(isNowOpen)
		}

		// A press on the trigger while open closes it
		// first. Without this the click would reopen it.
		const handleTriggerPress = () => (wasOpenOnPressRef.current = isPanelOpen)

		const handleTriggerClick = () => {
			if (wasOpenOnPressRef.current) return
			setOpen(true)
		}

		return (
			<host shadowDom>
				<span ref={anchorRef} class='popover-anchor' onpointerdown={handleTriggerPress} onclick={handleTriggerClick}>
					<slot name='trigger'></slot>
				</span>

				<div ref={panelRef} class={panelClassName} popover='auto' role='dialog' tabindex='-1' aria-label={props.label} ontoggle={handleToggle}>
					<slot></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			open: { type: Boolean, reflect: true },
			placement: { type: String, reflect: true, value: (): FloatingPlacementT => 'below' },
			alignment: { type: String, reflect: true, value: (): FloatingAlignmentT => 'start' },
			label: String
		},
		styles: [foundationSheet, popoverSheet]
	}
)
