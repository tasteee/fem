import { buildKeyMap } from '../src/music/layouts'
import { keyRows } from '../src/music/keys'
import { layouts } from '../src/music/layouts'

// Prints the degree under every key for each layout, top
// row first, to check a layout by eye.
const settings = { root: 'C', scale: 'major', octave: 3, seed: 1, custom: { rowStep: 7, colStep: 1 } }

for (const layout of layouts) {
	console.log(`\n${layout.label}`)
	const keyMap = buildKeyMap({ ...settings, layout: layout.id })
	const rowsTopFirst = [...keyRows].reverse()
	for (const row of rowsTopFirst) {
		const cells = row.map((keyCap) => {
			const degree = keyMap.get(keyCap.code)?.degree
			return `${keyCap.label}:${degree ?? '-'}`.padEnd(6)
		})
		console.log(cells.join(' '))
	}
}
