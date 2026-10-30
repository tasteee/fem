import type { NoteOutputT } from './engine'

export type MidiPortT = { id: string; name: string }

const noteOnStatus = 0x90
const noteOffStatus = 0x80
const controlChangeStatus = 0xb0
const allNotesOffController = 123

export const isMidiSupported = () => typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function'

// Midi access only asks the browser when it has to. A
// saved choice can reconnect quietly when the browser
// already allows it.
export const isMidiAllowed = async (): Promise<boolean> => {
	try {
		const status = await navigator.permissions.query({ name: 'midi' as PermissionName })
		return status.state === 'granted'
	} catch {
		return false
	}
}

export const requestMidi = (): Promise<MIDIAccess> => navigator.requestMIDIAccess()

export const listPorts = (access: MIDIAccess): MidiPortT[] => {
	return [...access.outputs.values()].map((port) => ({ id: port.id, name: port.name || 'MIDI output' }))
}

// Channel 1. The pedal stays in the app, so any device
// sustains the same way.
export const createMidiOutput = (access: MIDIAccess, portId: string): NoteOutputT | undefined => {
	const port = access.outputs.get(portId)
	if (!port) return undefined

	const noteOn = (midi: number, velocity: number) => {
		port.send([noteOnStatus, midi, Math.max(1, Math.min(127, velocity))])
	}
	const noteOff = (midi: number) => port.send([noteOffStatus, midi, 0])
	const allOff = () => port.send([controlChangeStatus, allNotesOffController, 0])

	return { noteOn, noteOff, allOff }
}
