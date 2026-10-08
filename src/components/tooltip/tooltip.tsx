import { c, useRef, useState } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { useFloatingPopover } from '../../foundation/use-floating-popover'
import tooltipCss from './tooltip.css?inline'

const tooltipSheet = createStyleSheet(tooltipCss)

export const Tooltip = c(
	(props) => {
		const anchorRef = useRef<HTMLSpanElement>()
		const panelRef = useRef<HTMLSpanElement>()
		const [isOpen, setOpen] = useState(false)

		useFloatingPopover(anchorRef, panelRef, isOpen, { placement: 'above', alignment: 'center' })

		const showTooltip = () => setOpen(true)
		const hideTooltip = () => setOpen(false)

		const handleKeyDown = (event: KeyboardEvent) => {
			const isEscape = event.key === 'Escape'
			if (isEscape) setOpen(false)
		}

		return (
			<host shadowDom>
				<span
					ref={anchorRef}
					class='tooltip-anchor'
					onpointerenter={showTooltip}
					onpointerleave={hideTooltip}
					onfocusin={showTooltip}
					onfocusout={hideTooltip}
					onkeydown={handleKeyDown}
				>
					<slot></slot>
				</span>

				<span ref={panelRef} class='tooltip-panel' popover='manual' role='tooltip'>
					{props.text}
				</span>
			</host>
		)
	},
	{
		props: {
			text: { type: String, value: (): string => '' }
		},
		styles: [foundationSheet, tooltipSheet]
	}
)
