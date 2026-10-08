import { c, useEffect, useEvent, useProp, useRef } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import toastCss from './toast.css?inline'

const toastSheet = createStyleSheet(toastCss)

export const Toast = c(
	(props) => {
		const toastRef = useRef<HTMLDivElement>()
		const [isOpen, setOpen] = useProp<boolean>('open')
		const dispatchClose = useEvent('close', { bubbles: true, composed: true })

		// Shows the toast, then closes it by itself
		// after its duration.
		useEffect(() => {
			const toastElement = toastRef.current
			if (!toastElement) return
			const isShown = toastElement.matches(':popover-open')
			if (!isOpen && isShown) toastElement.hidePopover()
			if (!isOpen) return
			if (!isShown) toastElement.showPopover()

			const closeToast = () => {
				setOpen(false)
				dispatchClose()
			}

			const closeTimer = setTimeout(closeToast, props.duration)
			const clearCloseTimer = () => clearTimeout(closeTimer)
			return clearCloseTimer
		}, [isOpen])

		return (
			<host shadowDom>
				<div ref={toastRef} class='toast' popover='manual' role='status'>
					<slot></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			open: { type: Boolean, reflect: true },
			duration: { type: Number, value: (): number => 2400 }
		},
		styles: [foundationSheet, toastSheet]
	}
)
