import { c, useEffect, useHost } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import checkboxGroupCss from './checkbox-group.css?inline'

type CheckboxElementT = HTMLElement & { name: string }

const checkboxGroupSheet = createStyleSheet(checkboxGroupCss)

// Groups checkboxes under one name and label. Each
// checked box sends its own value with the form, like
// native checkboxes that share a name.
export const CheckboxGroup = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()

		const shareName = () => {
			if (!props.name) return
			const checkboxes = [...hostRef.current.querySelectorAll<CheckboxElementT>('fem-checkbox')]
			for (const checkbox of checkboxes) checkbox.name = props.name
		}

		useEffect(shareName, [props.name])

		// The label shows like a fem-field label, so a
		// group reads the same as a single control.
		const hasLabel = Boolean(props.label)
		const groupLabel = hasLabel ? (
			<span class='group-label' id='group-label'>
				{props.label}
			</span>
		) : null
		const labelledBy = hasLabel ? 'group-label' : undefined

		return (
			<host shadowDom>
				<div class='checkbox-group' role='group' aria-labelledby={labelledBy}>
					{groupLabel}
					<slot onslotchange={shareName}></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			name: { type: String, reflect: true },
			label: String
		},
		styles: [foundationSheet, checkboxGroupSheet]
	}
)
