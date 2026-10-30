import type { PianoT } from '@tasteee/midi-piano'
import type { NoteOutputT } from './engine'

export type PianoOutputT = NoteOutputT & { setVolume: (volume: number) => void }

// The built-in piano: midi-piano on top of smplr's Splendid
// Grand Piano. The pedal stays in the engine, so this
// only ever starts and stops single notes.
export const createPianoOutput = (piano: Pick<PianoT, 'play' | 'stop'> & { volume: number }): PianoOutputT => {
	const noteOn = (midi: number, velocity: number) => piano.play(midi, { velocity })
	const noteOff = (midi: number) => piano.stop(midi)
	const allOff = () => piano.stop()
	const setVolume = (volume: number) => {
		piano.volume = volume
	}

	return { noteOn, noteOff, allOff, setVolume }
}
