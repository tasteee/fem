import { useEffect, useRef } from 'atomico'
import type { Ref } from 'atomico'

// The host of a component is always present, unlike
// a ref to an element it renders.
type HostRefT = { current: HTMLElement }

type SlidingIndicatorInputT = {
	hostRef: HostRefT
	trackRef: Ref<HTMLElement>
	indicatorRef: Ref<HTMLElement>
	itemTagName: string
	value: string | undefined
	// For items a component renders itself, in its own
	// shadow root, where the tag lookup can't see them.
	findSelectedItem?: () => HTMLElement | undefined
}

type ValuedElementT = HTMLElement & { value: string }

const findSelectedItem = (input: SlidingIndicatorInputT): HTMLElement | undefined => {
	const hasCustomFinder = input.findSelectedItem !== undefined
	if (hasCustomFinder) return input.findSelectedItem?.()
	const items = [...input.hostRef.current.querySelectorAll<ValuedElementT>(input.itemTagName)]
	return items.find((item) => item.value === input.value)
}

const getTrackScale = (track: HTMLElement, trackRect: DOMRect): number => {
	const layoutWidth = track.offsetWidth
	const hasLayoutWidth = layoutWidth > 0
	if (!hasLayoutWidth) return 1
	const scale = trackRect.width / layoutWidth
	const hasScale = scale > 0
	if (!hasScale) return 1
	return scale
}

// Moves the indicator over the selected item. The
// track can scroll, so its scroll offset is added
// back in.
const placeIndicator = (input: SlidingIndicatorInputT, isInstant: boolean) => {
	const track = input.trackRef.current
	const indicator = input.indicatorRef.current
	if (!track || !indicator) return

	const selectedItem = findSelectedItem(input)
	const hasSelection = selectedItem !== undefined
	indicator.classList.toggle('isHidden', !hasSelection)
	if (!hasSelection) return

	const trackRect = track.getBoundingClientRect()
	const itemRect = selectedItem.getBoundingClientRect()
	// A panel that's still scaling in reports shrunken
	// sizes. Dividing by its scale gives the real ones.
	const scale = getTrackScale(track, trackRect)
	const left = (itemRect.left - trackRect.left) / scale + track.scrollLeft
	const top = (itemRect.top - trackRect.top) / scale + track.scrollTop
	const width = itemRect.width / scale
	const height = itemRect.height / scale

	indicator.classList.toggle('isInstant', isInstant)
	indicator.style.setProperty('--slide-x', `${left}px`)
	indicator.style.setProperty('--slide-y', `${top}px`)
	indicator.style.setProperty('--slide-width', `${width}px`)
	indicator.style.setProperty('--slide-height', `${height}px`)
}

// fem's signature move: selection is a thing that
// moves. One indicator per group slides from the old
// choice to the new one. Layout changes re-measure
// without animating.
export const useSlidingIndicator = (input: SlidingIndicatorInputT) => {
	// Observers outlive a render, so they read the
	// latest input through this ref.
	const latestInputRef = useRef(input)
	latestInputRef.current = input

	useEffect(() => {
		const indicator = input.indicatorRef.current
		const wasPlaced = indicator?.dataset.placed === 'true'
		placeIndicator(input, !wasPlaced)
		if (indicator) indicator.dataset.placed = 'true'
	}, [input.value])

	useEffect(() => {
		const track = input.trackRef.current
		if (!track) return
		const placeInstantly = () => placeIndicator(latestInputRef.current, true)
		const resizeObserver = new ResizeObserver(placeInstantly)
		resizeObserver.observe(track)
		document.fonts?.ready.then(placeInstantly)
		return () => resizeObserver.disconnect()
	}, [])

	const handleItemsChange = () => placeIndicator(input, true)
	return { handleItemsChange }
}
