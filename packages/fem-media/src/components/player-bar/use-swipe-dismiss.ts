import { useRef } from 'atomico'

// Swipe the bar down to close it. It follows the finger,
// then either slides away or springs back. Seek and
// volume sliders keep their own drags.

const dismissDistance = 48
const tapSlop = 6
const slideOutMilliseconds = 180

type DragT = {
	pointerId: number
	startY: number
	offset: number
}

type BoxT<T> = { value: T }

type SwipeDismissInputT = {
	isEnabled: boolean
	handleDismiss: () => void
}

const sliderTags = ['FEM-SCRUBBER', 'FEM-SLIDER']

const checkStartsOnSlider = (event: PointerEvent): boolean => {
	const pathElements = event.composedPath() as Element[]
	const isSlider = (element: Element) => sliderTags.includes(element.tagName)
	return pathElements.some(isSlider)
}

const setOffset = (element: HTMLElement, offset: number, isAnimated: boolean) => {
	const transition = isAnimated ? `transform ${slideOutMilliseconds}ms var(--easing-standard)` : 'none'
	element.style.transition = transition
	element.style.transform = `translateY(${offset}px)`
}

const clearOffset = (element: HTMLElement) => {
	element.style.transition = ''
	element.style.transform = ''
}

export const useSwipeDismiss = (input: SwipeDismissInputT) => {
	const dragRef = useRef<BoxT<DragT | undefined>>()
	const wasDraggedRef = useRef<BoxT<boolean>>()
	if (!dragRef.current) dragRef.current = { value: undefined }
	if (!wasDraggedRef.current) wasDraggedRef.current = { value: false }
	const dragBox = dragRef.current
	const wasDraggedBox = wasDraggedRef.current

	const handlePointerDown = (event: PointerEvent) => {
		if (!input.isEnabled) return
		const isSlider = checkStartsOnSlider(event)
		if (isSlider) return
		wasDraggedBox.value = false
		dragBox.value = { pointerId: event.pointerId, startY: event.clientY, offset: 0 }
	}

	const handlePointerMove = (event: PointerEvent) => {
		const drag = dragBox.value
		if (!drag) return
		const isSamePointer = drag.pointerId === event.pointerId
		if (!isSamePointer) return
		const element = event.currentTarget as HTMLElement
		const offset = Math.max(0, event.clientY - drag.startY)
		const isPastSlop = offset > tapSlop
		if (!isPastSlop) return
		const isFirstMove = !wasDraggedBox.value
		if (isFirstMove) element.setPointerCapture(event.pointerId)
		wasDraggedBox.value = true
		drag.offset = offset
		setOffset(element, offset, false)
	}

	const slideAway = (element: HTMLElement) => {
		const height = element.getBoundingClientRect().height
		setOffset(element, height * 2, true)

		const finish = () => {
			input.handleDismiss()
			clearOffset(element)
		}

		window.setTimeout(finish, slideOutMilliseconds)
	}

	const handlePointerEnd = (event: PointerEvent) => {
		const drag = dragBox.value
		if (!drag) return
		dragBox.value = undefined
		const element = event.currentTarget as HTMLElement
		const shouldDismiss = drag.offset >= dismissDistance
		if (shouldDismiss) return slideAway(element)
		const wasMoved = drag.offset > 0
		if (wasMoved) setOffset(element, 0, true)
	}

	// A drag shouldn't also count as a tap on the track.
	const checkWasDragged = (): boolean => wasDraggedBox.value

	return { handlePointerDown, handlePointerMove, handlePointerEnd, checkWasDragged }
}
