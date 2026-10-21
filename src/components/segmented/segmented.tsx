import { c, useEvent, useHost, useProp, useRef } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { useSelectionGroup } from '../../foundation/use-selection-group'
import { useSlidingIndicator } from '../../foundation/use-sliding-indicator'
import segmentedCss from './segmented.css?inline'

const segmentedSheet = createStyleSheet(segmentedCss)

export const Segmented = c(
	() => {
		const hostRef = useHost<HTMLElement>()
		const trackRef = useRef<HTMLDivElement>()
		const indicatorRef = useRef<HTMLSpanElement>()
		const [value, setValue] = useProp<string>('value')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })
		const group = useSelectionGroup({ hostRef, itemTagName: 'fem-segment', value, setValue, dispatchChange })

		const slide = useSlidingIndicator({ hostRef, trackRef, indicatorRef, itemTagName: 'fem-segment', value })

		const handleSlotChange = () => {
			group.syncItems()
			slide.handleItemsChange()
		}

		return (
			<host shadowDom>
				<div
					ref={trackRef}
					class='segment-group'
					role='radiogroup'
					onclick={group.handleClick}
					onkeydown={group.handleKeyDown}
				>
					<span ref={indicatorRef} class='slide-indicator segment-indicator' aria-hidden='true'></span>
					<slot onslotchange={handleSlotChange}></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true, value: (): string => '' }
		},
		styles: [foundationSheet, segmentedSheet]
	}
)
