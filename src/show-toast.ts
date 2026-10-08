type ToastElementT = HTMLElement & { open: boolean; duration: number }

const defaultDurationMilliseconds = 2400
// Long enough for the closing animation to finish
// before the element is removed.
const removeDelayMilliseconds = 500

// Shows a short message at the bottom of the screen,
// then cleans up after itself.
export const showToast = (message: string, durationMilliseconds: number = defaultDurationMilliseconds) => {
	const toastElement = document.createElement('fem-toast') as ToastElementT
	toastElement.textContent = message
	toastElement.duration = durationMilliseconds
	document.body.appendChild(toastElement)

	const removeToast = () => toastElement.remove()
	const handleClose = () => setTimeout(removeToast, removeDelayMilliseconds)
	toastElement.addEventListener('close', handleClose)
	toastElement.open = true
}
