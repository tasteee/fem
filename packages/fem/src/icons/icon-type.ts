export type IconKindT = 'bold' | 'fill'

// One icon in both of its drawings. Each drawing is a
// list of path shapes for a 256 by 256 SVG.
export type IconT = {
	name: string
	bold: string[]
	fill: string[]
}
