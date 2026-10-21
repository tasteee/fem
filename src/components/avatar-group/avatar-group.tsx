import { c, useHost, useState } from 'atomico'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import avatarGroupCss from './avatar-group.css?inline'

const avatarGroupSheet = createStyleSheet(avatarGroupCss)

// Overlapping avatars. Past the max, the rest fold
// into a count.
export const AvatarGroup = c(
	(props) => {
		const hostRef = useHost<HTMLElement>()
		const [hiddenCount, setHiddenCount] = useState(0)

		const applyMax = () => {
			const avatars = [...hostRef.current.querySelectorAll<HTMLElement>(':scope > fem-avatar')]
			const maxVisible = Math.max(1, props.max)
			for (const [avatarIndex, avatar] of avatars.entries()) avatar.hidden = avatarIndex >= maxVisible
			const overflowCount = Math.max(0, avatars.length - maxVisible)
			setHiddenCount(overflowCount)
		}

		const hasOverflow = hiddenCount > 0
		const overflowLabel = `+${hiddenCount}`
		const overflowAccessibleLabel = `${hiddenCount} more`
		const overflow = hasOverflow ? (
			<span class='avatar-group-overflow' role='img' aria-label={overflowAccessibleLabel}>
				{overflowLabel}
			</span>
		) : null

		return (
			<host shadowDom>
				<div class='avatar-group'>
					<slot onslotchange={applyMax}></slot>
					{overflow}
				</div>
			</host>
		)
	},
	{
		props: {
			max: { type: Number, reflect: true, value: (): number => 4 }
		},
		styles: [foundationSheet, avatarGroupSheet]
	}
)
