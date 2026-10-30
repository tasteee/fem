import { c, useEvent, useProp } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { IconSvg } from '../../foundation/icons'
import { caretDownIcon } from '../../icons/generated'
import accordionItemCss from './accordion-item.css?inline'

const accordionItemSheet = createStyleSheet(accordionItemCss)

// One section that opens and closes. The summary
// slot is the always-visible header.
export const AccordionItem = c(
	(props) => {
		const [isOpen, setOpen] = useProp<boolean>('open')
		const dispatchToggle = useEvent('toggle', { bubbles: true, composed: true })
		const isCurrentlyOpen = Boolean(isOpen)

		const openClass = getFlagClass(isCurrentlyOpen, 'isOpen')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['accordion-item', openClass, disabledClass])
		const expandedLabel = String(isCurrentlyOpen)

		const handleHeaderClick = () => {
			setOpen(!isCurrentlyOpen)
			dispatchToggle()
		}

		return (
			<host shadowDom>
				<div class={className}>
					<button
						id='accordion-header'
						class='accordion-header'
						aria-expanded={expandedLabel}
						disabled={props.disabled}
						onclick={handleHeaderClick}
					>
						<span class='accordion-summary'>
							<slot name='summary'></slot>
						</span>
						<IconSvg icon={caretDownIcon} kind='bold' />
					</button>
					<div class='accordion-panel' role='region' aria-labelledby='accordion-header'>
						<div class='accordion-panel-inner'>
							<div class='accordion-content'>
								<slot></slot>
							</div>
						</div>
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			open: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, accordionItemSheet]
	}
)
