import { c, useHost } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import accordionCss from './accordion.css?inline'

type AccordionItemElementT = HTMLElement & { open: boolean }

const accordionSheet = createStyleSheet(accordionCss)

const closeOtherItems = (hostElement: HTMLElement, openedItem: AccordionItemElementT) => {
	const items = [...hostElement.querySelectorAll<AccordionItemElementT>('fem-accordion-item')]
	for (const item of items) {
		const isOpenedItem = item === openedItem
		if (!isOpenedItem) item.open = false
	}
}

// Stacks accordion items. With single, opening one
// closes the rest.
export const Accordion = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()

		const handleToggle = (event: Event) => {
			if (!props.single) return
			const toggledItem = event.target as AccordionItemElementT
			const isItem = toggledItem.localName === 'fem-accordion-item'
			if (!isItem) return
			if (toggledItem.open) closeOtherItems(hostRef.current, toggledItem)
		}

		return (
			<host shadowDom ontoggle={handleToggle}>
				<div class='accordion'>
					<slot></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			single: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, accordionSheet]
	}
)
