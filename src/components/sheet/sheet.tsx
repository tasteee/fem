import { c, useEvent, useProp, useRef } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { checkIsBackdropClick, useModal } from '../../foundation/use-modal'
import sheetCss from './sheet.css?inline'

const sheetSheet = createStyleSheet(sheetCss)

export const Sheet = c(
	(props) => {
		const dialogRef = useRef<HTMLDialogElement>()
		const [isOpen, setOpen] = useProp<boolean>('open')
		const dispatchClose = useEvent('close', { bubbles: true, composed: true })

		useModal(dialogRef, Boolean(isOpen))

		// Runs for every way the sheet can close:
		// Escape, the backdrop, or the open flag.
		const handleClose = () => {
			setOpen(false)
			dispatchClose()
		}

		const handleClick = (event: Event) => {
			const isBackdropClick = checkIsBackdropClick(event)
			if (isBackdropClick) setOpen(false)
		}

		const hasHeading = props.heading !== ''
		const heading = hasHeading ? <h2 class='sheet-heading'>{props.heading}</h2> : null

		return (
			<host shadowDom>
				<dialog ref={dialogRef} class='sheet' aria-label={props.heading} onclose={handleClose} onclick={handleClick}>
					<div class='sheet-body'>
						<span class='sheet-handle'></span>
						{heading}
						<div class='sheet-content'>
							<slot></slot>
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
		styles: [foundationSheet, sheetSheet]
	}
)
