import { describe, expect, it } from 'vitest'
import { defaultSettings, readSettings } from './settings'

describe('settings', () => {
	it('starts on the Isomorphic (Push) layout', () => {
		expect(defaultSettings().layout).toBe('fourths')
		expect(readSettings(undefined).layout).toBe('fourths')
	})

	it('starts on octave 2', () => {
		expect(defaultSettings().octave).toBe(2)
		expect(readSettings({ octave: 'x' }).octave).toBe(2)
	})

	it('keeps a layout someone already saved', () => {
		expect(readSettings({ layout: 'standard' }).layout).toBe('standard')
	})

	it('falls back per field when a saved value is wrong', () => {
		const settings = readSettings({ layout: 'nope', octave: 99, root: 'H' })
		expect(settings.layout).toBe('fourths')
		expect(settings.octave).toBe(6)
		expect(settings.root).toBe('C')
	})
})
