import { useEffect, useRef } from 'atomico'
import type { Ref } from 'atomico'
import { positionFloating } from './position-floating'
import type { FloatingOptionsT } from './position-floating'

const hidePopover = (floatingElement: HTMLElement) => {
	const isShown = floatingElement.matches(':popover-open')
	if (isShown) floatingElement.hidePopover()
}

const showPopover = (floatingElement: HTMLElement) => {
	const isShown = floatingElement.matches(':popover-open')
	if (!isShown) floatingElement.showPopover()
}

// The element that has focus, looking through shadow
// roots.
const getDeepActiveElement = (): HTMLElement | null => {
	let active = document.activeElement as HTMLElement | null
	while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement as HTMLElement
	return active
}

// Walks the rendered tree: slotted content counts as
// inside the slot it is shown in, and shadow content as
// inside its host.
const checkInsideComposed = (container: Node, node: Node | null): boolean => {
	let current: Node | null = node
	while (current) {
		if (current === container) return true
		const slot = (current as Element).assignedSlot
		current = slot ?? current.parentNode ?? (current as ShadowRoot).host ?? null
	}
	return false
}

// Shows a popover next to its anchor and keeps it
// there while the page scrolls or resizes.
export const useFloatingPopover = (
	anchorRef: Ref<HTMLElement>,
	floatingRef: Ref<HTMLElement>,
	isOpen: boolean,
	options: FloatingOptionsT
) => {
	// What had focus when the panel opened. The browser
	// can't restore focus into a trigger inside another
	// component's shadow root, so this does it.
	const openerRef = useRef<HTMLElement | null>(null)

	useEffect(() => {
		const anchorElement = anchorRef.current
		const floatingElement = floatingRef.current
		if (!anchorElement || !floatingElement) return
		if (!isOpen) {
			const opener = openerRef.current
			openerRef.current = null
			hidePopover(floatingElement)
			// Focus that was lost or left inside the closing
			// panel goes back. Focus the person moved
			// elsewhere stays there.
			const active = getDeepActiveElement()
			const isLost = !active || active === document.body || checkInsideComposed(floatingElement, active)
			if (opener && opener.isConnected && isLost) opener.focus()
			return
		}

		if (!floatingElement.matches(':popover-open')) openerRef.current = getDeepActiveElement()

		const updatePosition = () => positionFloating(anchorElement, floatingElement, options)
		showPopover(floatingElement)
		updatePosition()
		window.addEventListener('resize', updatePosition)
		window.addEventListener('scroll', updatePosition, true)

		const removeListeners = () => {
			window.removeEventListener('resize', updatePosition)
			window.removeEventListener('scroll', updatePosition, true)
		}

		return removeListeners
	}, [isOpen])
}
