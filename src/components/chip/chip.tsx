import { c, useEvent, useProp } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import chipCss from './chip.css?inline'

export type ChipSizeT = 'small' | 'medium' | 'large'

const chipSheet = createStyleSheet(chipCss)

// A choice you toggle, like a filter. A chosen chip
// inverts.
export const Chip = c(
	(props) => {
		const [isSelected, setSelected] = useProp<boolean>('selected')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const sizeClass = getModifierClass(props.size)
		const selectedClass = getFlagClass(isSelected, 'isSelected')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['chip', sizeClass, selectedClass, disabledClass])

		const pressedLabel = String(Boolean(isSelected))

		const handleClick = () => {
			setSelected(!isSelected)
			dispatchChange()
		}

		return (
			<host shadowDom>
				<button class={className} disabled={props.disabled} aria-pressed={pressedLabel} onclick={handleClick}>
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
