// Where notes go: the built-in piano or a MIDI port.
export type NoteOutputT = {
	noteOn: (midi: number, velocity: number) => void
	noteOff: (midi: number) => void
	allOff: () => void
}

export type EngineT = {
	press: (source: string, midi: number, velocity: number) => void
	release: (source: string) => void
	setPedal: (isDown: boolean) => void
	releaseAll: () => void
	// Swaps the output. The old one goes quiet first.
	setOutput: (output: NoteOutputT) => void
	isPedalDown: () => boolean
}

// Turns presses into note on and off, with a sustain
// pedal. A source is whatever pressed: a key, a pointer.
// Each press remembers its own note, so changing
// settings never strands a held key.
export const createEngine = (initialOutput: NoteOutputT, onChange: () => void): EngineT => {
	let output = initialOutput
	let isPedalDown = false
	const held = new Map<string, number>()
	const sustained = new Set<number>()

	const isHeld = (midi: number) => [...held.values()].includes(midi)

	const press = (source: string, midi: number, velocity: number) => {
		if (held.has(source)) return
		const isSounding = isHeld(midi) || sustained.has(midi)
		if (isSounding) output.noteOff(midi)
		sustained.delete(midi)
		held.set(source, midi)
		output.noteOn(midi, velocity)
		onChange()
	}

	const release = (source: string) => {
		const midi = held.get(source)
		if (midi === undefined) return
		held.delete(source)
		const isStillHeld = isHeld(midi)
		if (!isStillHeld) {
			if (isPedalDown) sustained.add(midi)
			else output.noteOff(midi)
		}
		onChange()
	}

	const setPedal = (isDown: boolean) => {
		if (isDown === isPedalDown) return
		isPedalDown = isDown
		if (!isDown) {
			sustained.forEach((midi) => {
				if (!isHeld(midi)) output.noteOff(midi)
			})
			sustained.clear()
		}
		onChange()
	}

	const releaseAll = () => {
		held.clear()
		sustained.clear()
		isPedalDown = false
		output.allOff()
		onChange()
	}

	const setOutput = (next: NoteOutputT) => {
		output.allOff()
		held.clear()
		sustained.clear()
		output = next
		onChange()
	}

	return { press, release, setPedal, releaseAll, setOutput, isPedalDown: () => isPedalDown }
}
