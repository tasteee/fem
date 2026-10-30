import { describe, expect, it } from 'vitest'
import { createEngine, type NoteOutputT } from './engine'

const makeOutput = () => {
	const log: string[] = []
	const output: NoteOutputT = {
		noteOn: (midi) => log.push(`on ${midi}`),
		noteOff: (midi) => log.push(`off ${midi}`),
		allOff: () => log.push('all off')
	}
	return { log, output }
}

describe('engine', () => {
	it('stops a note when its key is released', () => {
		const { log, output } = makeOutput()
		const engine = createEngine(output, () => {})
		engine.press('a', 60, 100)
		engine.release('a')
		expect(log).toEqual(['on 60', 'off 60'])
	})

	it('keeps a note ringing under the pedal until it lifts', () => {
		const { log, output } = makeOutput()
		const engine = createEngine(output, () => {})
		engine.setPedal(true)
		engine.press('d', 64, 100)
		engine.release('d')
		expect(log).toEqual(['on 64'])
		engine.setPedal(false)
		expect(log).toEqual(['on 64', 'off 64'])
	})

	it('does not cut a note that is held again when the pedal lifts', () => {
		const { log, output } = makeOutput()
		const engine = createEngine(output, () => {})
		engine.setPedal(true)
		engine.press('d', 64, 100)
		engine.release('d')
		engine.press('d', 64, 100)
		engine.setPedal(false)
		expect(log).toEqual(['on 64', 'off 64', 'on 64'])
	})

	it('releases the note a key started, not the one it maps to now', () => {
		const { log, output } = makeOutput()
		const engine = createEngine(output, () => {})
		engine.press('a', 60, 100)
		engine.release('a')
		expect(log.at(-1)).toBe('off 60')
	})

	it('releases everything and lifts the pedal', () => {
		const { log, output } = makeOutput()
		const engine = createEngine(output, () => {})
		engine.setPedal(true)
		engine.press('a', 60, 100)
		engine.releaseAll()
		expect(engine.isPedalDown()).toBe(false)
		expect(log.at(-1)).toBe('all off')
	})

	it('keeps a shared note until the last key lifts', () => {
		const { log, output } = makeOutput()
		const engine = createEngine(output, () => {})
		engine.press('a', 60, 100)
		engine.press('b', 60, 100)
		engine.release('a')
		expect(log.filter((entry) => entry === 'off 60').length).toBe(1)
		engine.release('b')
		expect(log.at(-1)).toBe('off 60')
	})
})
