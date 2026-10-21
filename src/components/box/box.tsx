import { c } from 'atomico'
import { buildClassName, getFlagClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import boxCss from './box.css?inline'

export type BoxDirectionT = 'row' | 'column'
export type BoxAlignT = 'start' | 'center' | 'end' | 'stretch' | 'between'
export type BoxSpaceT = 'none' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10'

const boxSheet = createStyleSheet(boxCss)

type BoxPropsT = {
	direction: BoxDirectionT
	alignX?: BoxAlignT
	alignY?: BoxAlignT
	gap: BoxSpaceT
	padding: BoxSpaceT
	wrap?: boolean
}

// alignX and alignY always mean the screen axes.
// The box turns them into flexbox terms for its
// direction, so nobody has to remember which one
// justify-content is.
const getAlignXClass = (props: BoxPropsT): string => {
	const hasAlignX = Boolean(props.alignX)
	if (!hasAlignX) return ''
	return `isX-${props.alignX}`
}

const getAlignYClass = (props: BoxPropsT): string => {
	const hasAlignY = Boolean(props.alignY)
	if (!hasAlignY) return ''
	return `isY-${props.alignY}`
}

const buildBoxClassName = (props: BoxPropsT, direction: BoxDirectionT): string => {
	const directionClass = direction === 'row' ? 'isRow' : 'isColumn'
	const gapClass = `isGap-${props.gap}`
	const paddingClass = `isPadding-${props.padding}`
	const wrapClass = getFlagClass(props.wrap, 'isWrap')
	const alignXClass = getAlignXClass(props)
	const alignYClass = getAlignYClass(props)
	return buildClassName(['box', directionClass, gapClass, paddingClass, wrapClass, alignXClass, alignYClass])
}

const sharedProps = {
	alignX: { type: String, reflect: true },
	alignY: { type: String, reflect: true },
	gap: { type: String, reflect: true, value: (): BoxSpaceT => 'none' },
	padding: { type: String, reflect: true, value: (): BoxSpaceT => 'none' },
	wrap: { type: Boolean, reflect: true },
	grow: { type: Boolean, reflect: true }
}

const renderBox = (className: string) => {
	return (
		<host shadowDom>
			<div class={className}>
				<slot></slot>
			</div>
		</host>
	)
}

// The general box. Picks its direction from an
// attribute. Row is the default.
export const Box = c(
	(props) => {
		const direction = props.direction as BoxDirectionT
		const className = buildBoxClassName(props as BoxPropsT, direction)
		return renderBox(className)
	},
	{
		props: {
			...sharedProps,
			direction: { type: String, reflect: true, value: (): BoxDirectionT => 'row' }
		},
		styles: [foundationSheet, boxSheet]
	}
)

// A box that is always a row. Reads better in markup.
export const Row = c(
	(props) => {
		const className = buildBoxClassName(props as BoxPropsT, 'row')
		return renderBox(className)
	},
	{
		props: sharedProps,
		styles: [foundationSheet, boxSheet]
	}
)

// A box that is always a column.
export const Column = c(
	(props) => {
		const className = buildBoxClassName(props as BoxPropsT, 'column')
		return renderBox(className)
	},
	{
		props: sharedProps,
		styles: [foundationSheet, boxSheet]
	}
)
