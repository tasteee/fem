import { c, useEvent } from 'atomico'
import { buildClassName, getFlagClass, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { useSlotFilled } from '../../foundation/use-slot-filled'
import listItemCss from './list-item.css?inline'

export type ListItemSizeT = 'medium' | 'large'

const listItemSheet = createStyleSheet(listItemCss)

type HitAreaPropsT = {
	href: string
	handleClick: () => void
}

// One invisible control covers the row, so trailing
// buttons can sit on top without nesting buttons. The
// visible label names it, whether it comes from the
// label prop or the default slot.
const HitArea = (props: HitAreaPropsT) => {
	const isLink = props.href !== ''
	if (isLink) return <a class='list-item-hit' href={props.href} aria-labelledby='list-item-label'></a>

	return (
		<button class='list-item-hit' type='button' aria-labelledby='list-item-label' onclick={props.handleClick}></button>
	)
}

// A row with a picture, a title, a line under it, and
// room for actions at the end. Tracks, people, files.
export const ListItem = c(
	(props) => {
		const dispatchSelect = useEvent('select', { bubbles: true, composed: true })
		const [hasLeading, handleLeadingChange] = useSlotFilled()
		const [hasMeta, handleMetaChange] = useSlotFilled()
		const [hasTrailing, handleTrailingChange] = useSlotFilled()

		const isLink = props.href !== ''
		const isInteractive = props.interactive || isLink
		const hasDescription = props.description !== ''

		const sizeClass = getModifierClass(props.size)
		const interactiveClass = getFlagClass(isInteractive, 'isInteractive')
		const selectedClass = getFlagClass(props.selected, 'isSelected')
		const disabledClass = getFlagClass(props.disabled, 'isDisabled')
		const className = buildClassName(['list-item', sizeClass, interactiveClass, selectedClass, disabledClass])

		const leadingClass = buildClassName(['list-item-leading', getFlagClass(!hasLeading, 'isEmpty')])
		const metaClass = buildClassName(['list-item-meta', getFlagClass(!hasMeta, 'isEmpty')])
		const trailingClass = buildClassName(['list-item-trailing', getFlagClass(!hasTrailing, 'isEmpty')])

		const currentState = props.selected ? 'true' : null

		const handleClick = () => dispatchSelect()
		const hitArea = <HitArea href={props.href} handleClick={handleClick} />
		const maybeHitArea = isInteractive ? hitArea : null

		return (
			<host shadowDom>
				<div class={className} aria-current={currentState}>
					{maybeHitArea}
					<span class={leadingClass}>
						<slot name='leading' onslotchange={handleLeadingChange}></slot>
					</span>
					<span class='list-item-body'>
						<span id='list-item-label' class='list-item-label'>
							{props.label}
							<slot></slot>
						</span>
						<span class='list-item-description' hidden={!hasDescription}>
							{props.description}
						</span>
					</span>
					<span class={metaClass}>
						<slot name='meta' onslotchange={handleMetaChange}></slot>
					</span>
					<span class={trailingClass}>
						<slot name='trailing' onslotchange={handleTrailingChange}></slot>
					</span>
				</div>
			</host>
		)
	},
	{
		props: {
			label: { type: String, value: (): string => '' },
			description: { type: String, value: (): string => '' },
			href: { type: String, value: (): string => '' },
			size: { type: String, reflect: true, value: (): ListItemSizeT => 'medium' },
			interactive: { type: Boolean, reflect: true },
			selected: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true }
		},
		styles: [foundationSheet, listItemSheet]
	}
)
