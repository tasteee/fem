import { c } from 'atomico'
import { buildClassName, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import avatarCss from './avatar.css?inline'

export type AvatarSizeT = 'small' | 'medium' | 'large'
export type AvatarColorT = 'neutral' | 'accent'

const avatarSheet = createStyleSheet(avatarCss)

export const Avatar = c(
	(props) => {
		const sizeClass = getModifierClass(props.size)
		const colorClass = getModifierClass(props.color)
		const className = buildClassName(['avatar', sizeClass, colorClass])
		const hasImage = props.src !== ''
		const initial = props.name.trim().charAt(0)
		const image = <img class='avatar-image' src={props.src} alt='' />
		// With no image, the first letter of the name
		// stands in.
		const content = hasImage ? image : initial

		return (
			<host shadowDom>
				<span class={className} role='img' aria-label={props.name}>
					{content}
				</span>
			</host>
		)
	},
	{
		props: {
			size: { type: String, reflect: true, value: (): AvatarSizeT => 'medium' },
			color: { type: String, reflect: true, value: (): AvatarColorT => 'neutral' },
			name: { type: String, value: (): string => '' },
			src: { type: String, value: (): string => '' }
		},
		styles: [foundationSheet, avatarSheet]
	}
)
