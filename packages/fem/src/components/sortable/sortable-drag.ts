// Pointer and keyboard reordering for fem-sortable.
// Items slide with transforms while dragged. The DOM
// only changes once, on drop, and only if asked to.

export type ReorderDetailT = {
	from: number
	to: number
}

export type SortableOptionsT = {
	getShouldMoveNodes: () => boolean
	getIsDisabled: () => boolean
	announce: (message: string) => void
	dispatchReorder: (detail: ReorderDetailT) => void
}

type DragStateT = {
	item: HTMLElement
	items: HTMLElement[]
	rects: DOMRect[]
	fromIndex: number
	toIndex: number
	startY: number
	startScrollY: number
	pointerId: number
	slotStep: number
}

type PendingStateT = {
	item: HTMLElement
	pointerId: number
	startX: number
	startY: number
	isTouch: boolean
	longPressTimer: number
}

const dragThresholdPixels = 4
const longPressMilliseconds = 280
const handleSelector = '[data-sortable-handle]'
const interactiveSelector = 'button, a, input, select, textarea, [contenteditable]'

// ---------- reading the list ----------

const getItems = (host: HTMLElement): HTMLElement[] => {
	const children = Array.from(host.children) as HTMLElement[]
	return children.filter((child) => !child.hidden)
}

// The item is the host's direct child that holds the
// event's target.
const findItem = (host: HTMLElement, event: Event): HTMLElement | undefined => {
	const path = event.composedPath()
	const pathElements = path.filter((entry) => entry instanceof HTMLElement) as HTMLElement[]
	return pathElements.find((element) => element.parentElement === host)
}

const findHandle = (event: Event): HTMLElement | undefined => {
	const path = event.composedPath()
	const pathElements = path.filter((entry) => entry instanceof HTMLElement) as HTMLElement[]
	return pathElements.find((element) => element.matches(handleSelector))
}

// With handles, only a handle starts a drag. Without,
// the whole item does, except its own controls.
const checkCanStartFrom = (item: HTMLElement, event: PointerEvent): boolean => {
	const hasHandles = item.querySelector(handleSelector) !== null
	const handle = findHandle(event)
	if (hasHandles) return handle !== undefined
	const target = event.target as HTMLElement
	const isOnControl = target !== item && target.closest(interactiveSelector) !== null
	return !isOnControl
}

// The space from one item's top to the next one's,
// minus the dragged item's height, is the list's gap.
const getGap = (rects: DOMRect[]): number => {
	const hasPair = rects.length > 1
	if (!hasPair) return 0
	return Math.max(0, rects[1].top - rects[0].bottom)
}

const getSlideMilliseconds = (host: HTMLElement): number => {
	const durationText = getComputedStyle(host).getPropertyValue('--duration-slide').trim()
	const isSeconds = durationText.endsWith('s') && !durationText.endsWith('ms')
	const amount = parseFloat(durationText)
	const hasAmount = Number.isFinite(amount)
	if (!hasAmount) return 180
	if (isSeconds) return amount * 1000
	return amount
}

// ---------- moving ----------

const setOffset = (element: HTMLElement, offsetY: number) => {
	const hasOffset = offsetY !== 0
	element.style.transform = hasOffset ? `translate3d(0, ${offsetY}px, 0)` : ''
}

const getTargetIndex = (state: DragStateT, draggedCenter: number): number => {
	let targetIndex = state.fromIndex

	for (const [index, rect] of state.rects.entries()) {
		const isDragged = index === state.fromIndex
		if (isDragged) continue
		const middle = rect.top + rect.height / 2
		const isAboveAndPassed = index < state.fromIndex && draggedCenter < middle
		const isBelowAndPassed = index > state.fromIndex && draggedCenter > middle
		if (isAboveAndPassed) targetIndex = Math.min(targetIndex, index)
		if (isBelowAndPassed) targetIndex = Math.max(targetIndex, index)
	}

	return targetIndex
}

// Items between the old and new spot step aside by
// one slot to open a gap for the dragged item.
const shiftSiblings = (state: DragStateT) => {
	for (const [index, item] of state.items.entries()) {
		const isDragged = index === state.fromIndex
		if (isDragged) continue
		const isPushedUp = index > state.fromIndex && index <= state.toIndex
		const isPushedDown = index < state.fromIndex && index >= state.toIndex
		const pushUp = isPushedUp ? -state.slotStep : 0
		const pushDown = isPushedDown ? state.slotStep : 0
		setOffset(item, pushUp + pushDown)
	}
}

const getRestingOffset = (state: DragStateT): number => {
	const isSamePlace = state.toIndex === state.fromIndex
	if (isSamePlace) return 0
	const isMovingDown = state.toIndex > state.fromIndex
	const fromRect = state.rects[state.fromIndex]
	const toRect = state.rects[state.toIndex]
	if (isMovingDown) return toRect.bottom - fromRect.bottom
	return toRect.top - fromRect.top
}

const moveNode = (host: HTMLElement, detail: ReorderDetailT) => {
	const items = getItems(host)
	const movedItem = items[detail.from]
	const isMovingDown = detail.to > detail.from
	const anchorItem = items[detail.to]
	if (isMovingDown) return anchorItem.after(movedItem)
	anchorItem.before(movedItem)
}

const buildPositionMessage = (position: number, total: number): string => `Position ${position} of ${total}`

// ---------- controller ----------

export const createSortable = (host: HTMLElement, options: SortableOptionsT): (() => void) => {
	let pending: PendingStateT | undefined
	let drag: DragStateT | undefined
	let grabbedItem: HTMLElement | undefined

	const applyReorder = (detail: ReorderDetailT) => {
		const isSamePlace = detail.from === detail.to
		if (isSamePlace) return
		const shouldMove = options.getShouldMoveNodes()
		if (shouldMove) moveNode(host, detail)
		options.dispatchReorder(detail)
	}

	// ---------- pointer ----------

	const clearPending = () => {
		if (!pending) return
		window.clearTimeout(pending.longPressTimer)
		pending = undefined
	}

	const beginDrag = (item: HTMLElement, pointerId: number, startY: number) => {
		const items = getItems(host)
		const rects = items.map((entry) => entry.getBoundingClientRect())
		const fromIndex = items.indexOf(item)
		const slotStep = rects[fromIndex].height + getGap(rects)
		drag = { item, items, rects, fromIndex, toIndex: fromIndex, startY, startScrollY: window.scrollY, pointerId, slotStep }
		for (const entry of items) entry.setAttribute('data-sortable-active', '')
		item.setAttribute('data-sortable-dragging', '')
		host.setAttribute('data-dragging', '')
		options.announce(`Picked up. ${buildPositionMessage(fromIndex + 1, items.length)}`)
	}

	const updateDrag = (clientY: number) => {
		if (!drag) return
		const scrolled = window.scrollY - drag.startScrollY
		const offsetY = clientY - drag.startY + scrolled
		const fromRect = drag.rects[drag.fromIndex]
		const draggedCenter = fromRect.top + fromRect.height / 2 + offsetY
		setOffset(drag.item, offsetY)
		const targetIndex = getTargetIndex(drag, draggedCenter)
		const hasMoved = targetIndex !== drag.toIndex
		if (!hasMoved) return
		drag.toIndex = targetIndex
		shiftSiblings(drag)
	}

	const cleanUpDrag = (state: DragStateT) => {
		for (const entry of state.items) {
			entry.removeAttribute('data-sortable-active')
			entry.removeAttribute('data-sortable-dragging')
			entry.removeAttribute('data-sortable-settling')
			setOffset(entry, 0)
		}
		host.removeAttribute('data-dragging')
	}

	// The dragged item glides into its slot, then the
	// list is put back in order for real.
	const finishDrag = (isCancelled: boolean) => {
		const state = drag
		if (!state) return
		drag = undefined
		if (isCancelled) state.toIndex = state.fromIndex
		shiftSiblings(state)
		state.item.setAttribute('data-sortable-settling', '')
		setOffset(state.item, getRestingOffset(state))
		const detail = { from: state.fromIndex, to: state.toIndex }
		const total = state.items.length

		const settle = () => {
			cleanUpDrag(state)
			applyReorder(detail)
			options.announce(`Dropped. ${buildPositionMessage(detail.to + 1, total)}`)
		}

		window.setTimeout(settle, getSlideMilliseconds(host))
		suppressNextClick()
	}

	// A drag ends with a pointerup, which the browser
	// turns into a click on the item. That click is
	// not a tap, so it is swallowed.
	const suppressNextClick = () => {
		const swallowClick = (event: MouseEvent) => {
			event.stopPropagation()
			event.preventDefault()
		}
		window.addEventListener('click', swallowClick, { capture: true, once: true })
		const removeSwallow = () => window.removeEventListener('click', swallowClick, { capture: true })
		window.setTimeout(removeSwallow, 0)
	}

	const handlePointerDown = (event: PointerEvent) => {
		const isMainButton = event.button === 0
		const isBusy = drag !== undefined || options.getIsDisabled()
		if (!isMainButton || isBusy) return
		const item = findItem(host, event)
		if (!item) return
		const canStart = checkCanStartFrom(item, event)
		if (!canStart) return
		const isTouch = event.pointerType === 'touch'
		const isOnHandle = findHandle(event) !== undefined
		const shouldWaitForLongPress = isTouch && !isOnHandle
		// The long press starts the drag itself, so the
		// wait is over.
		const startNow = () => {
			pending = undefined
			beginDrag(item, event.pointerId, event.clientY)
		}

		const longPressTimer = shouldWaitForLongPress ? window.setTimeout(startNow, longPressMilliseconds) : 0
		pending = { item, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, isTouch, longPressTimer }
	}

	const handlePointerMove = (event: PointerEvent) => {
		const isDragPointer = drag !== undefined && event.pointerId === drag.pointerId
		if (isDragPointer) return updateDrag(event.clientY)
		if (!pending) return
		const isPendingPointer = event.pointerId === pending.pointerId
		if (!isPendingPointer) return
		const distance = Math.hypot(event.clientX - pending.startX, event.clientY - pending.startY)
		const hasLeftThreshold = distance > dragThresholdPixels
		if (!hasLeftThreshold) return
		// A touch that moves before the long press is a
		// scroll, not a drag.
		const isWaitingTouch = pending.isTouch && pending.longPressTimer !== 0
		const pendingItem = pending.item
		const startY = pending.startY
		clearPending()
		if (isWaitingTouch) return
		beginDrag(pendingItem, event.pointerId, startY)
		updateDrag(event.clientY)
	}

	const handlePointerUp = () => {
		clearPending()
		finishDrag(false)
	}

	const handlePointerCancel = () => {
		clearPending()
		finishDrag(true)
	}

	// Once a drag is on, the page must not scroll under
	// the finger.
	const handleTouchMove = (event: TouchEvent) => {
		const isDragging = drag !== undefined
		if (isDragging) event.preventDefault()
	}

	// Handles live in light DOM, out of reach of the
	// shadow styles, so they are set up here. Touch on a
	// handle never scrolls the page.
	const prepareHandle = (handle: HTMLElement) => {
		handle.style.touchAction = 'none'
		handle.style.cursor = 'grab'
	}

	const prepareHandles = () => {
		const handles = Array.from(host.querySelectorAll(handleSelector)) as HTMLElement[]
		for (const handle of handles) prepareHandle(handle)
	}

	// ---------- keyboard ----------

	const stepItem = (item: HTMLElement, direction: number, focusTarget: HTMLElement) => {
		const items = getItems(host)
		const fromIndex = items.indexOf(item)
		const toIndex = Math.min(items.length - 1, Math.max(0, fromIndex + direction))
		const isSamePlace = toIndex === fromIndex
		if (isSamePlace) return
		applyReorder({ from: fromIndex, to: toIndex })
		options.announce(buildPositionMessage(toIndex + 1, items.length))
		// Moving a node drops its focus, and a framework
		// may move it a moment later, so focus returns
		// after both.
		const restoreFocus = () => focusTarget.focus()
		requestAnimationFrame(restoreFocus)
	}

	const setGrabbed = (item: HTMLElement | undefined) => {
		if (grabbedItem) grabbedItem.removeAttribute('data-sortable-grabbed')
		grabbedItem = item
		if (!item) return
		item.setAttribute('data-sortable-grabbed', '')
	}

	const getArrowDirection = (key: string): number => {
		const isUp = key === 'ArrowUp' || key === 'ArrowLeft'
		if (isUp) return -1
		const isDown = key === 'ArrowDown' || key === 'ArrowRight'
		if (isDown) return 1
		return 0
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		if (options.getIsDisabled()) return
		const item = findItem(host, event)
		if (!item) return
		const focusTarget = event.composedPath()[0] as HTMLElement
		const direction = getArrowDirection(event.key)
		const isArrow = direction !== 0
		const isGrabbed = grabbedItem === item

		// Alt with an arrow moves an item from anywhere
		// inside it, like moving a line in an editor.
		const isAltMove = event.altKey && isArrow
		if (isAltMove) {
			event.preventDefault()
			return stepItem(item, direction, focusTarget)
		}

		if (isGrabbed && isArrow) {
			event.preventDefault()
			return stepItem(item, direction, focusTarget)
		}

		const isToggleKey = event.key === ' ' || event.key === 'Enter'
		const isOnHandle = findHandle(event) !== undefined
		const shouldToggleGrab = isToggleKey && isOnHandle
		if (shouldToggleGrab) {
			event.preventDefault()
			const nextGrabbed = isGrabbed ? undefined : item
			setGrabbed(nextGrabbed)
			const grabMessage = 'Picked up. Use the arrow keys to move, Space to drop.'
			const message = nextGrabbed ? grabMessage : 'Dropped.'
			return options.announce(message)
		}

		const isEscape = event.key === 'Escape'
		const shouldRelease = isEscape && isGrabbed
		if (!shouldRelease) return
		setGrabbed(undefined)
		options.announce('Dropped.')
	}

	const handleFocusOut = (event: FocusEvent) => {
		const nextTarget = event.relatedTarget as Node | null
		// Moving a node blurs it for a moment, with no
		// next target. That is not the person leaving.
		const isMovingNode = nextTarget === null
		if (isMovingNode) return
		const isLeavingList = !host.contains(nextTarget)
		if (isLeavingList) setGrabbed(undefined)
	}

	host.addEventListener('pointerdown', handlePointerDown)
	window.addEventListener('pointermove', handlePointerMove)
	window.addEventListener('pointerup', handlePointerUp)
	window.addEventListener('pointercancel', handlePointerCancel)
	host.addEventListener('touchmove', handleTouchMove, { passive: false })
	host.addEventListener('keydown', handleKeyDown)
	host.addEventListener('focusout', handleFocusOut)
	const handleObserver = new MutationObserver(prepareHandles)
	handleObserver.observe(host, { childList: true, subtree: true })
	prepareHandles()

	const destroy = () => {
		clearPending()
		host.removeEventListener('pointerdown', handlePointerDown)
		window.removeEventListener('pointermove', handlePointerMove)
		window.removeEventListener('pointerup', handlePointerUp)
		window.removeEventListener('pointercancel', handlePointerCancel)
		host.removeEventListener('touchmove', handleTouchMove)
		host.removeEventListener('keydown', handleKeyDown)
		host.removeEventListener('focusout', handleFocusOut)
		handleObserver.disconnect()
	}

	return destroy
}
