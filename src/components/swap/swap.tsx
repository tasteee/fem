import { c, useEvent, useProp, useRef } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { usePressFeedback } from '../../foundation/use-press-feedback'
import swapCss from './swap.css?inline'

export type SwapSizeT = 'small' | 'medium' | 'large'
export type SwapKindT = 'solid' | 'ghost'
export type SwapColorT = 'neutral' | 'accent'

const swapSheet = createStyleSheet(swapCss)

export const Swap = c(
	(props) => {
		const swapRef = useRef<HTMLButtonElement>()
		usePressFeedback(swapRef)

		const [isOn, setOn] = useProp<boolean>('on')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const sizeClass = getModifierClass(props.size)
		const kindClass = getModifierClass(props.kind)
		const colorClass = getModifierClass(props.color)
		const onClass = getFlagClass(isOn, 'isOn')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['swap', 'isPressable', sizeClass, kindClass, colorClass, onClass, disabledClass])
		const pressedLabel = String(Boolean(isOn))

		const handleClick = () => {
			setOn(!isOn)
			dispatchChange()
		}

		return (
			<host shadowDom>
				<button
					ref={swapRef}
					class={className}
					disabled={props.disabled}
					aria-pressed={pressedLabel}
					aria-label={props.label}
					onclick={handleClick}
				>
					<span class='swap-face isOffFace'>
						<slot name='off'></slot>
					</span>
					<span class='swap-face isOnFace'>
						<slot name='on'></slot>
					</span>
				</button>
			</host>
		)
	},
	{
		props: {
			size: { type: String, reflect: true, value: (): SwapSizeT => 'medium' },
			kind: { type: String, reflect: true, value: (): SwapKindT => 'solid' },
			color: { type: String, reflect: true, value: (): SwapColorT => 'neutral' },
			on: { type: Boolean, reflect: true },
			label: String,
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, swapSheet]
	}
)
