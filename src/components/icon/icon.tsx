import { c, useEffect, useState } from 'atomico'
import { buildClassName, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import { buildIconPaths } from '../../foundation/icons'
import type { IconKindT } from '../../icons/icon-type'
import { getIcon, subscribeToIcons } from '../../icons/registry'
import iconCss from './icon.css?inline'

export type IconSizeT = 'small' | 'medium' | 'large'

const iconSheet = createStyleSheet(iconCss)

export const Icon = c(
	(props) => {
		// Bumped when icons are registered, so an icon
		// that was missing at first can appear.
		const [registryVersion, setRegistryVersion] = useState(0)

		useEffect(() => {
			const handleRegistryChange = () => setRegistryVersion(registryVersion + 1)
			return subscribeToIcons(handleRegistryChange)
		}, [registryVersion])

		const icon = getIcon(props.name)
		const pathShapes = icon ? icon[props.kind] : []
		const paths = buildIconPaths(pathShapes)
		const sizeClass = getModifierClass(props.size)
		const className = buildClassName(['icon', sizeClass])
		// An icon with a label is read out. One without
		// is decoration, hidden from screen readers.
		const hasLabel = props.label !== ''
		const role = hasLabel ? 'img' : 'presentation'
		const hiddenLabel = String(!hasLabel)

		return (
			<host shadowDom>
				<svg class={className} viewBox='0 0 256 256' role={role} aria-label={props.label} aria-hidden={hiddenLabel}>
					{paths}
				</svg>
			</host>
		)
	},
	{
		props: {
			name: { type: String, reflect: true, value: (): string => '' },
			kind: { type: String, reflect: true, value: (): IconKindT => 'bold' },
			size: { type: String, reflect: true, value: (): IconSizeT => 'medium' },
			label: { type: String, value: (): string => '' }
		},
		styles: [foundationSheet, iconSheet]
	}
)
