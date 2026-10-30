import { describe, expect, it } from 'vitest'
import { buildKeyMap, type MapSettingsT } from './layouts'

const base: MapSettingsT = {
	root: 'C',
	scale: 'major',
	octave: 3,
	layout: 'standard',
	seed: 1,
	custom: { rowStep: 7, colStep: 1 }
}

const names = (settings: Partial<MapSettingsT>, codes: string[]) => {
	const keyMap = buildKeyMap({ ...base, ...settings })
	return codes.map((code) => keyMap.get(code)?.name)
}

const homeRow = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK']

describe('standard layout', () => {
	it('plays C4 on A and E4 on D in C major, octave 3', () => {
		const keyMap = buildKeyMap(base)
		expect(keyMap.get('KeyA')?.midi).toBe(60)
		expect(keyMap.get('KeyD')?.midi).toBe(64)
	})

	it('climbs the scale along the home row', () => {
		expect(names({}, homeRow)).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'])
	})
})

describe('spelling', () => {
	it('spells C♭ and G♭ in E♭ minor', () => {
		const spelled = names({ root: 'Eb', scale: 'minor' }, homeRow)
		expect(spelled).toEqual(['E♭4', 'F4', 'G♭4', 'A♭4', 'B♭4', 'C♭5', 'D♭5', 'E♭5'])
	})

	it('puts C♭ in the octave of its letter', () => {
		const keyMap = buildKeyMap({ ...base, root: 'Eb', scale: 'minor' })
		expect(keyMap.get('KeyH')?.name).toBe('C♭5')
		expect(keyMap.get('KeyH')?.midi).toBe(71)
	})

	it('spells E♯ in F♯ major', () => {
		expect(names({ root: 'F#' }, homeRow)).toContain('E♯5')
	})

	it('spells chromatic in D♭ with flats', () => {
		expect(names({ root: 'Db', layout: 'chromatic' }, ['KeyZ', 'KeyX', 'KeyC'])).toEqual(['D♭3', 'D3', 'E♭3'])
		const row = buildKeyMap({ ...base, root: 'Db', layout: 'chromatic' })
		const allNames = [...row.values()].map((key) => key.name)
		expect(allNames.some((name) => name.includes('♯'))).toBe(false)
		expect(allNames.some((name) => name.includes('♭'))).toBe(true)
	})
})

describe('staircase', () => {
	it('plays only V B N M J K L O P 0', () => {
		const keyMap = buildKeyMap({ ...base, layout: 'staircase' })
		const playing = [...keyMap.values()].filter((key) => key.midi !== undefined).map((key) => key.label)
		expect(new Set(playing)).toEqual(new Set(['V', 'B', 'N', 'M', 'J', 'K', 'L', 'O', 'P', '0']))
	})

	it('climbs one degree per key', () => {
		const path = ['KeyV', 'KeyB', 'KeyN', 'KeyM', 'KeyJ', 'KeyK', 'KeyL', 'KeyO', 'KeyP', 'Digit0']
		expect(names({ layout: 'staircase' }, path).slice(0, 4)).toEqual(['C3', 'D3', 'E3', 'F3'])
	})
})

describe('range', () => {
	it('silences notes outside MIDI 21 to 108', () => {
		const high = buildKeyMap({ ...base, octave: 6 })
		expect(high.get('Digit0')?.midi).toBeUndefined()
		const low = buildKeyMap({ ...base, octave: 0 })
		expect(low.get('KeyZ')?.midi).toBeUndefined()
	})
})

describe('random', () => {
	it('is stable for a seed and changes with it', () => {
		const first = buildKeyMap({ ...base, layout: 'random', seed: 5 })
		const again = buildKeyMap({ ...base, layout: 'random', seed: 5 })
		const other = buildKeyMap({ ...base, layout: 'random', seed: 6 })
		const pick = (keyMap: ReturnType<typeof buildKeyMap>) => [...keyMap.values()].map((key) => key.degree)
		expect(pick(first)).toEqual(pick(again))
		expect(pick(first)).not.toEqual(pick(other))
	})
})

describe('isomorphic (Push) layout', () => {
	const midiOf = (settings: Partial<MapSettingsT>, code: string) => buildKeyMap({ ...base, ...settings }).get(code)?.midi

	it('maps A to the note on V, S to B, and D to N', () => {
		for (const scale of ['major', 'minor', 'dorian']) {
			const settings = { layout: 'fourths', scale }
			expect(midiOf(settings, 'KeyA')).toBe(midiOf(settings, 'KeyV'))
			expect(midiOf(settings, 'KeyS')).toBe(midiOf(settings, 'KeyB'))
			expect(midiOf(settings, 'KeyD')).toBe(midiOf(settings, 'KeyN'))
		}
	})

	it('maps Q to the note on F and Z, X, C climb in order', () => {
		const settings = { layout: 'fourths' }
		expect(midiOf(settings, 'KeyQ')).toBe(midiOf(settings, 'KeyM'))
		const climb = ['KeyZ', 'KeyX', 'KeyC'].map((code) => midiOf(settings, code) as number)
		expect(climb[0]).toBeLessThan(climb[1])
		expect(climb[1]).toBeLessThan(climb[2])
	})

	it('keeps chromatic rows a fourth (5 semitones) apart', () => {
		const settings = { layout: 'chromatic' }
		expect(midiOf(settings, 'KeyA')).toBe(midiOf(settings, 'KeyN'))
		expect(midiOf(settings, 'KeyS')).toBe(midiOf(settings, 'KeyM'))
	})
})
