import { c, useEvent, useProp, useRef } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { usePressFeedback } from '../../foundation/use-press-feedback'
import chipCss from './chip.css?inline'

export type ChipSizeT = 'small' | 'medium' | 'large'

const chipSheet = createStyleSheet(chipCss)

export const Chip = c(
	(props) => {
		const chipRef = useRef<HTMLButtonElement>()
		usePressFeedback(chipRef)

		const [isSelected, setSelected] = useProp<boolean>('selected')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const sizeClass = getModifierClass(props.size)
		const selectedClass = getFlagClass(isSelected, 'isSelected')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['chip', 'isPressable', sizeClass, selectedClass, disabledClass])

		const handleClick = () => {
			setSelected(!isSelected)
			dispatchChange()
		}

		return (
			<host shadowDom>
				<button ref={chipRef} class={className} disabled={props.disabled} aria-pressed={isSelected} onclick={handleClick}>
					<slot></slot>
				</button>
			</host>
		)
	},
	{
		props: {
			size: { type: String, reflect: true, value: (): ChipSizeT => 'small' },
			selected: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, chipSheet]
	}
)
