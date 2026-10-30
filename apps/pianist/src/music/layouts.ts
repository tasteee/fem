import { keyRows } from './keys'
import { findRoot, isPlayable, noteForDegree, noteForSemitone } from './notes'

export type CustomParamsT = { rowStep: number; colStep: number }

export type LayoutContextT = { seed: number; custom: CustomParamsT }

// A layout says what each key means: a scale degree
// (or a semitone for chromatic), or nothing.
export type LayoutT = {
	id: string
	label: string
	isChromatic: boolean
	place: (row: number, column: number, context: LayoutContextT) => number | null
}

// V B N M J K L O P 0, climbing one degree per key.
const staircasePath = ['KeyV', 'KeyB', 'KeyN', 'KeyM', 'KeyJ', 'KeyK', 'KeyL', 'KeyO', 'KeyP', 'Digit0']

const staircaseDegrees = new Map(staircasePath.map((code, degree) => [code, degree]))

// A small seeded generator, so one seed always makes the
// same map.
const makeRandom = (seed: number) => {
	let state = seed >>> 0
	return () => {
		state = (state + 0x6d2b79f5) >>> 0
		let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
		mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
		return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
	}
}

const randomSpan = 21

export const layouts: LayoutT[] = [
	{
		id: 'standard',
		label: 'Standard',
		isChromatic: false,
		place: (row, column) => row * 7 + column
	},
	{
		id: 'fourths',
		label: 'Isomorphic (Push)',
		isChromatic: false,
		place: (row, column) => row * 3 + column
	},
	{
		id: 'chromatic',
		label: 'Isomorphic chromatic',
		isChromatic: true,
		place: (row, column) => row * 5 + column
	},
	{
		id: 'thirds',
		label: 'Thirds',
		isChromatic: false,
		place: (row, column) => row * 2 + column
	},
	{
		id: 'staircase',
		label: 'Staircase',
		isChromatic: false,
		place: (row, column) => {
			const code = keyRows[row][column].code
			return staircaseDegrees.get(code) ?? null
		}
	},
	{
		id: 'random',
		label: 'Random',
		isChromatic: false,
		place: (row, column, context) => {
			const random = makeRandom(context.seed + row * 97 + column * 7919)
			return Math.floor(random() * randomSpan)
		}
	},
	{
		id: 'custom',
		label: 'Custom',
		isChromatic: false,
		place: (row, column, context) => row * context.custom.rowStep + column * context.custom.colStep
	}
]

export const findLayout = (id: string): LayoutT => layouts.find((layout) => layout.id === id) ?? layouts[0]

export type KeyInfoT = {
	code: string
	label: string
	row: number
	column: number
	// Undefined for keys with no note.
	degree: number | undefined
	midi: number | undefined
	name: string
	isRoot: boolean
}

export type MapSettingsT = {
	root: string
	scale: string
	octave: number
	layout: string
	seed: number
	custom: CustomParamsT
}

// Every key and what it plays right now. Keys with no
// degree, or a note outside piano range, get no midi.
export const buildKeyMap = (settings: MapSettingsT): Map<string, KeyInfoT> => {
	const layout = findLayout(settings.layout)
	const root = findRoot(settings.root)
	const context: LayoutContextT = { seed: settings.seed, custom: settings.custom }
	const keyMap = new Map<string, KeyInfoT>()

	keyRows.forEach((rowKeys, row) => {
		rowKeys.forEach((keyCap, column) => {
			const degree = layout.place(row, column, context)
			const base = { code: keyCap.code, label: keyCap.label, row, column }
			const hasDegree = degree !== null
			if (!hasDegree)
				return keyMap.set(keyCap.code, { ...base, degree: undefined, midi: undefined, name: '', isRoot: false })

			const note = layout.isChromatic
				? noteForSemitone(degree, root, settings.octave)
				: noteForDegree(degree, root, settings.scale, settings.octave)
			const midi = isPlayable(note.midi) ? note.midi : undefined
			const name = `${note.name}${note.octave}`
			const isRoot = layout.isChromatic ? note.midi % 12 === root.pitchClass : note.isRoot
			keyMap.set(keyCap.code, { ...base, degree, midi, name, isRoot })
		})
	})

	return keyMap
}
