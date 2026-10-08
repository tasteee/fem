export type FloatingPlacementT = 'below' | 'above'
export type FloatingAlignmentT = 'start' | 'center'

export type FloatingOptionsT = {
	placement: FloatingPlacementT
	alignment: FloatingAlignmentT
}

const gapPixels = 8
const viewportMarginPixels = 8

const getTop = (anchorRect: DOMRect, floatingHeight: number, placement: FloatingPlacementT): number => {
	const neededSpace = floatingHeight + gapPixels
	const fitsBelow = window.innerHeight - anchorRect.bottom >= neededSpace
	const fitsAbove = anchorRect.top >= neededSpace
	const topBelow = anchorRect.bottom + gapPixels
	const topAbove = anchorRect.top - gapPixels - floatingHeight
	const prefersBelow = placement === 'below'
	// Flips to the other side only when the preferred
	// side lacks room and the other side has it.
	if (prefersBelow && !fitsBelow && fitsAbove) return topAbove
	if (prefersBelow) return topBelow
	if (!fitsAbove && fitsBelow) return topBelow
	return topAbove
}

const getLeft = (anchorRect: DOMRect, floatingWidth: number, alignment: FloatingAlignmentT): number => {
	const startLeft = anchorRect.left
	const centerLeft = anchorRect.left + anchorRect.width / 2 - floatingWidth / 2
	const preferredLeft = alignment === 'center' ? centerLeft : startLeft
	const maximumLeft = window.innerWidth - floatingWidth - viewportMarginPixels
	return Math.max(viewportMarginPixels, Math.min(preferredLeft, maximumLeft))
}

// Writes the position as CSS variables. The size is
// read with offsetWidth and offsetHeight because those
// ignore the scale used by the opening animation.
export const positionFloating = (anchorElement: HTMLElement, floatingElement: HTMLElement, options: FloatingOptionsT) => {
	const anchorRect = anchorElement.getBoundingClientRect()
	floatingElement.style.setProperty('--floating-anchor-width', `${anchorRect.width}px`)
	const top = getTop(anchorRect, floatingElement.offsetHeight, options.placement)
	const left = getLeft(anchorRect, floatingElement.offsetWidth, options.alignment)
	floatingElement.style.setProperty('--floating-top', `${top}px`)
	floatingElement.style.setProperty('--floating-left', `${left}px`)
}
