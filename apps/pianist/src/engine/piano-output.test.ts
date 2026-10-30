import { describe, expect, it } from 'vitest'
import { createPianoOutput } from './piano-output'

const makePiano = () => {
	const calls: unknown[][] = []
	const piano = {
		volume: 1,
		play: (...args: unknown[]) => calls.push(['play', ...args]),
		stop: (...args: unknown[]) => calls.push(['stop', ...args])
	}
	return { calls, piano }
}

describe('piano output', () => {
	it('plays and stops one note by midi number', () => {
		const { calls, piano } = makePiano()
		const output = createPianoOutput(piano as never)
		output.noteOn(60, 100)
		output.noteOff(60)
		expect(calls).toEqual([
			['play', 60, { velocity: 100 }],
			['stop', 60]
		])
	})

	it('stops everything with no argument', () => {
		const { calls, piano } = makePiano()
		createPianoOutput(piano as never).allOff()
		expect(calls).toEqual([['stop']])
	})

	it('passes volume through', () => {
		const { piano } = makePiano()
		createPianoOutput(piano as never).setVolume(0.4)
		expect(piano.volume).toBe(0.4)
	})
})
