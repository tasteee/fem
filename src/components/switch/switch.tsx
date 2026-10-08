import { c, useEvent, useProp } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import switchCss from './switch.css?inline'

const switchSheet = createStyleSheet(switchCss)

export const Switch = c(
	(props) => {
		const [isChecked, setChecked] = useProp<boolean>('checked')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const checkedClass = getFlagClass(isChecked, 'isChecked')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['choice', 'switch', checkedClass, disabledClass])
		const checkedLabel = String(Boolean(isChecked))

		const handleClick = () => {
			setChecked(!isChecked)
			dispatchChange()
		}

		return (
			<host shadowDom>
				<button class={className} role='switch' aria-checked={checkedLabel} disabled={props.disabled} onclick={handleClick}>
					<span class='switch-track'>
						<span class='switch-thumb'></span>
					</span>
					<span class='choice-label'>
						<slot></slot>
					</span>
				</button>
			</host>
		)
	},
	{
		props: {
			checked: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, switchSheet]
	}
)
