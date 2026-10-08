import { c, useEvent, useProp, useRef } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { checkIsBackdropClick, useModal } from '../../foundation/use-modal'
import dialogCss from './dialog.css?inline'

const dialogSheet = createStyleSheet(dialogCss)

export const Dialog = c(
	(props) => {
		const dialogRef = useRef<HTMLDialogElement>()
		const [isOpen, setOpen] = useProp<boolean>('open')
		const dispatchClose = useEvent('close', { bubbles: true, composed: true })

		useModal(dialogRef, Boolean(isOpen))

		// Runs for every way the dialog can close:
		// Escape, the backdrop, or the open flag.
		const handleClose = () => {
			setOpen(false)
			dispatchClose()
		}

		const handleClick = (event: Event) => {
			const isBackdropClick = checkIsBackdropClick(event)
			if (isBackdropClick) setOpen(false)
		}

		return (
			<host shadowDom>
				<dialog ref={dialogRef} class='dialog' aria-label={props.heading} onclose={handleClose} onclick={handleClick}>
					<div class='dialog-body'>
						<h2 class='dialog-heading'>{props.heading}</h2>
						<div class='dialog-content'>
							<slot></slot>
						</div>
						<div class='dialog-actions'>
							<slot name='actions'></slot>
						</div>
					</div>
				</dialog>
			</host>
		)
	},
	{
		props: {
			open: { type: Boolean, reflect: true },
			heading: { type: String, value: (): string => '' }
		},
		styles: [foundationSheet, dialogSheet]
	}
)
