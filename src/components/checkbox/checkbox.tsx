import { c, useEvent, useProp } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { CheckIcon } from '../../foundation/icons'
import checkboxCss from './checkbox.css?inline'

const checkboxSheet = createStyleSheet(checkboxCss)

export const Checkbox = c(
	(props) => {
		const [isChecked, setChecked] = useProp<boolean>('checked')
		const dispatchChange = useEvent('change', { bubbles: true, composed: true })

		const checkedClass = getFlagClass(isChecked, 'isChecked')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['choice', 'checkbox', checkedClass, disabledClass])
		const checkedLabel = String(Boolean(isChecked))

		const handleClick = () => {
			setChecked(!isChecked)
			dispatchChange()
		}

		return (
			<host shadowDom>
				<button class={className} role='checkbox' aria-checked={checkedLabel} disabled={props.disabled} onclick={handleClick}>
					<span class='checkbox-mark'>
						<CheckIcon />
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
		styles: [foundationSheet, checkboxSheet]
	}
)
