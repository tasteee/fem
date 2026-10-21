import { c } from 'atomico'
import { buildClassName, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import spinnerCss from './spinner.css?inline'

export type SpinnerSizeT = 'small' | 'medium' | 'large'

const spinnerSheet = createStyleSheet(spinnerCss)

// Takes its color from the text around it.
export const Spinner = c(
	(props) => {
		const sizeClass = getModifierClass(props.size)
		const className = buildClassName(['spinner', sizeClass])
		const label = props.label ?? 'Loading'

		return (
			<host shadowDom>
				<span class={className} role='status' aria-label={label}></span>
			</host>
		)
	},
	{
		props: {
			size: { type: String, reflect: true, value: (): SpinnerSizeT => 'medium' },
			label: String
		},
		styles: [foundationSheet, spinnerSheet]
	}
)
