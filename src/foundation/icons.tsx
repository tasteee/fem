import type { IconKindT, IconT } from '../icons/icon-type'

export type IconSvgPropsT = {
	icon: IconT
	kind: IconKindT
}

export const buildIconPaths = (pathShapes: string[]) => {
	return pathShapes.map((pathShape) => <path d={pathShape}></path>)
}

// Draws an icon. Components use this for the icons
// they need themselves, with no registration.
export const IconSvg = (props: IconSvgPropsT) => {
	const paths = buildIconPaths(props.icon[props.kind])

	return (
		<svg class='icon' viewBox='0 0 256 256' aria-hidden='true'>
			{paths}
		</svg>
	)
}
