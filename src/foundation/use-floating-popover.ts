import { useEffect } from 'atomico'
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

// Shows a popover next to its anchor and keeps it
// there while the page scrolls or resizes.
export const useFloatingPopover = (
	anchorRef: Ref<HTMLElement>,
	floatingRef: Ref<HTMLElement>,
	isOpen: boolean,
	options: FloatingOptionsT
) => {
	useEffect(() => {
		const anchorElement = anchorRef.current
		const floatingElement = floatingRef.current
		if (!anchorElement || !floatingElement) return
		if (!isOpen) return hidePopover(floatingElement)

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
