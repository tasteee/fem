import { c } from 'atomico'
import { buildClassName, getModifierClass } from '../../foundation/class-names'
import { createStyleSheet } from '../../foundation/create-style-sheet'
import { foundationSheet } from '../../foundation/foundation-sheet'
import headingCss from './heading.css?inline'

export type HeadingSizeT = 'display' | 'title' | 'heading' | 'large'

const headingSheet = createStyleSheet(headingCss)

// Each level has a natural size. Pass size to break
// the link, like a small h1 in a dense tool.
const sizeForLevel: Record<number, HeadingSizeT> = {
	1: 'display',
	2: 'title',
	3: 'heading',
	4: 'large',
	5: 'large',
	6: 'large'
}

const getHeadingLevel = (level: number): number => {
	const isInRange = level >= 1 && level <= 6
	if (!isInRange) return 2
	return level
}

export const Heading = c(
	(props) => {
		const headingLevel = getHeadingLevel(props.level)
		const naturalSize = sizeForLevel[headingLevel]
		const headingSize = props.size ?? naturalSize
		const sizeClass = getModifierClass(headingSize)
		const className = buildClassName(['heading', sizeClass])
		const ariaLevel = String(headingLevel)

		return (
			<host shadowDom>
				<div class={className} role='heading' aria-level={ariaLevel}>
					<slot></slot>
				</div>
			</host>
		)
	},
	{
		props: {
			level: { type: Number, reflect: true, value: (): number => 2 },
			size: { type: String, reflect: true }
		},
		styles: [foundationSheet, headingSheet]
	}
)
