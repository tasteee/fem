import { useEffect } from 'atomico'
import type { Ref } from 'atomico'

// A quick tap ends before the eye can see it, so
// every press is held for a minimum time.
const minimumPressMilliseconds = 70
const pressStartTimes = new WeakMap<HTMLElement, number>()

const startPress = (element: HTMLElement) => {
	pressStartTimes.set(element, performance.now())
	element.classList.add('isPressed')
}

const endPress = (element: HTMLElement) => {
	const startTime = pressStartTimes.get(element)
	const wasPressed = startTime !== undefined
	if (!wasPressed) return
	pressStartTimes.delete(element)
	const heldMilliseconds = performance.now() - startTime
	const remainingMilliseconds = Math.max(0, minimumPressMilliseconds - heldMilliseconds)
	const releasePress = () => element.classList.remove('isPressed')
	setTimeout(releasePress, remainingMilliseconds)
}

const pressEndEvents = ['pointerup', 'pointerleave', 'pointercancel']

export const usePressFeedback = (elementRef: Ref<HTMLElement>) => {
	useEffect(() => {
		const element = elementRef.current
		if (!element) return
		const handlePressStart = () => startPress(element)
		const handlePressEnd = () => endPress(element)
		element.addEventListener('pointerdown', handlePressStart)
		for (const eventName of pressEndEvents) element.addEventListener(eventName, handlePressEnd)

		const removeListeners = () => {
			element.removeEventListener('pointerdown', handlePressStart)
			for (const eventName of pressEndEvents) element.removeEventListener(eventName, handlePressEnd)
		}

		return removeListeners
	}, [])
}
