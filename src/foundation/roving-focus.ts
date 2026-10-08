export type RovingOrientationT = 'vertical' | 'horizontal'

type RovingItemT = HTMLElement & { disabled?: boolean }

export const getEnabledItems = (hostElement: HTMLElement, tagName: string): HTMLElement[] => {
	const allItems = [...hostElement.querySelectorAll<RovingItemT>(tagName)]
	return allItems.filter((item) => !item.disabled)
}

// Each item keeps its real button inside its own
// shadow root, so focus has to be sent there.
export const focusItem = (item: HTMLElement | undefined) => {
	if (!item) return
	const innerButton = item.shadowRoot?.querySelector<HTMLElement>('button')
	if (innerButton) innerButton.focus()
}

const getNextItem = (items: HTMLElement[], key: string, orientation: RovingOrientationT): HTMLElement | undefined => {
	const isVertical = orientation === 'vertical'
	const forwardKey = isVertical ? 'ArrowDown' : 'ArrowRight'
	const backwardKey = isVertical ? 'ArrowUp' : 'ArrowLeft'
	const lastIndex = items.length - 1
	const currentIndex = items.findIndex((item) => item.matches(':focus-within'))
	const hasCurrent = currentIndex !== -1
	if (key === 'Home') return items[0]
	if (key === 'End') return items[lastIndex]
	if (key === forwardKey && !hasCurrent) return items[0]
	if (key === backwardKey && !hasCurrent) return items[lastIndex]
	// Movement wraps around at both ends.
	if (key === forwardKey) return items[(currentIndex + 1) % items.length]
	if (key === backwardKey) return items[(currentIndex + lastIndex) % items.length]
	return undefined
}

// Moves focus between items with the arrow keys,
// Home, and End.
export const handleRovingKeyDown = (event: KeyboardEvent, items: HTMLElement[], orientation: RovingOrientationT) => {
	const nextItem = getNextItem(items, event.key, orientation)
	if (!nextItem) return
	event.preventDefault()
	focusItem(nextItem)
}
