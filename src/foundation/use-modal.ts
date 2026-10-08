import { useEffect } from 'atomico'
import type { Ref } from 'atomico'

// Keeps a native dialog element in step with an
// open flag. The native element gives the top layer,
// the focus trap, and Escape to close.
export const useModal = (dialogRef: Ref<HTMLDialogElement>, isOpen: boolean) => {
	useEffect(() => {
		const dialogElement = dialogRef.current
		if (!dialogElement) return
		const shouldShow = isOpen && !dialogElement.open
		const shouldClose = !isOpen && dialogElement.open
		if (shouldShow) dialogElement.showModal()
		if (shouldClose) dialogElement.close()
	}, [isOpen])
}

// A click on the dialog element itself, and not on
// anything inside it, landed on the dimmed backdrop.
export const checkIsBackdropClick = (event: Event): boolean => {
	return event.target === event.currentTarget
}
