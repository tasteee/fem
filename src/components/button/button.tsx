import { c, useRef } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { usePressFeedback } from '../../foundation/use-press-feedback'
import buttonCss from './button.css?inline'

export type ButtonSizeT = 'small' | 'medium' | 'large'
export type ButtonKindT = 'solid' | 'soft' | 'ghost'
export type ButtonColorT = 'neutral' | 'accent' | 'danger' | 'success' | 'warning' | 'info'
export type ButtonShapeT = 'pill' | 'circle'

const buttonSheet = createStyleSheet(buttonCss)

export const Button = c(
	(props) => {
		const buttonRef = useRef<HTMLButtonElement>()
		usePressFeedback(buttonRef)

		const isInert = props.disabled || props.loading
		const sizeClass = getModifierClass(props.size)
		const kindClass = getModifierClass(props.kind)
		const colorClass = getModifierClass(props.color)
		const shapeClass = getModifierClass(props.shape)
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['button', 'isPressable', sizeClass, kindClass, colorClass, shapeClass, disabledClass])
		const spinner = props.loading ? <span class='spinner' aria-hidden='true'></span> : null

		return (
			<host shadowDom>
				<button ref={buttonRef} class={className} disabled={isInert} aria-busy={props.loading}>
					{spinner}
					<slot></slot>
				</button>
			</host>
		)
	},
	{
		props: {
			size: { type: String, reflect: true, value: (): ButtonSizeT => 'medium' },
			kind: { type: String, reflect: true, value: (): ButtonKindT => 'solid' },
			color: { type: String, reflect: true, value: (): ButtonColorT => 'neutral' },
			shape: { type: String, reflect: true, value: (): ButtonShapeT => 'pill' },
			disabled: { type: Boolean, reflect: true },
			loading: { type: Boolean, reflect: true },
			wide: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, buttonSheet]
	}
)
