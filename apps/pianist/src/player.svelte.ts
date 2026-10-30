import { createEngine, type NoteOutputT } from './engine/engine'
import {
	createMidiOutput,
	isMidiAllowed,
	isMidiSupported,
	listPorts,
	requestMidi,
	type MidiPortT
} from './engine/midi-output'
import { createPianoSynth } from './engine/piano-synth'
import { pedalCode, keyRows } from './music/keys'
import type { KeyInfoT } from './music/layouts'
import { loadSettings, saveSettings, type SettingsT } from './settings'

const synth = createPianoSynth()
const builtinId = 'builtin'
const builtinVelocity = 100

export const settings = $state<SettingsT>(loadSettings())
export const live = $state({
	pressed: [] as string[],
	isPedalDown: false,
	ports: [] as MidiPortT[],
	hasMidiAccess: false,
	midiMessage: ''
})

export const midiSupported = isMidiSupported()

let midiAccess: MIDIAccess | undefined
let keyMap = new Map<string, KeyInfoT>()
const pressedSources = new Set<string>()

const engine = createEngine(synth, () => {
	live.pressed = [...pressedSources]
	live.isPedalDown = engine.isPedalDown()
})

export const setKeyMap = (next: Map<string, KeyInfoT>) => {
	keyMap = next
}

// The saved output, or the built-in piano when that
// device is not there right now.
const pickOutput = (): NoteOutputT => {
	const isBuiltin = settings.output === builtinId
	const midiOutput = !isBuiltin && midiAccess ? createMidiOutput(midiAccess, settings.output) : undefined
	return midiOutput ?? synth
}

const isUsingMidi = () => pickOutput() !== synth

export const applyOutput = () => {
	pressedSources.clear()
	engine.setOutput(pickOutput())
}

export const applySettings = () => {
	saveSettings($state.snapshot(settings))
	synth.setVolume(settings.volume)
}

const refreshPorts = () => {
	if (!midiAccess) return
	live.ports = listPorts(midiAccess)
	applyOutput()
}

export const connectMidi = async () => {
	if (!midiSupported) return
	try {
		midiAccess = await requestMidi()
		live.hasMidiAccess = true
		live.midiMessage = ''
		midiAccess.onstatechange = refreshPorts
		refreshPorts()
	} catch {
		live.midiMessage = 'MIDI access was blocked. Allow it in your browser to use MIDI devices.'
	}
}

// A saved MIDI choice reconnects by itself, but only when
// the browser would not need to ask.
export const reconnectMidiQuietly = async () => {
	const wantsMidi = settings.output !== builtinId
	if (!midiSupported || !wantsMidi) return
	if (await isMidiAllowed()) await connectMidi()
}

const getVelocity = () => (isUsingMidi() ? Math.max(1, Math.round(settings.volume * 127)) : builtinVelocity)

export const pressSource = (source: string, key: KeyInfoT | undefined) => {
	if (!key || key.midi === undefined) return
	pressedSources.add(source)
	engine.press(source, key.midi, getVelocity())
}

export const releaseSource = (source: string) => {
	pressedSources.delete(source)
	engine.release(source)
}

export const setPedal = (isDown: boolean) => engine.setPedal(isDown)

export const releaseEverything = () => {
	pressedSources.clear()
	engine.releaseAll()
}

// Controls never keep focus, so the next key plays
// instead of nudging the control.
export const blurActive = () => {
	let active: Element | null = document.activeElement
	while (active) {
		if (active instanceof HTMLElement) active.blur()
		active = active.shadowRoot?.activeElement ?? null
	}
}

const isTyping = (event: Event) => {
	return event.composedPath().some((target) => {
		if (!(target instanceof HTMLElement)) return false
		return ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable
	})
}

const allCodes = new Set(keyRows.flat().map((keyCap) => keyCap.code))

const handleKeyDown = (event: KeyboardEvent) => {
	const hasModifier = event.ctrlKey || event.metaKey || event.altKey
	const isOurs = allCodes.has(event.code) || event.code === pedalCode
	if (!isOurs || hasModifier || isTyping(event)) return
	event.preventDefault()
	if (event.repeat) return
	if (event.code === pedalCode) return setPedal(true)
	pressSource(event.code, keyMap.get(event.code))
}

const handleKeyUp = (event: KeyboardEvent) => {
	const isOurs = allCodes.has(event.code) || event.code === pedalCode
	if (!isOurs || isTyping(event)) return
	event.preventDefault()
	if (event.code === pedalCode) return setPedal(false)
	releaseSource(event.code)
}

const handleHidden = () => {
	if (document.hidden) releaseEverything()
}

// Starts listening. Returns a cleanup.
export const startPlayer = () => {
	window.addEventListener('keydown', handleKeyDown, { capture: true })
	window.addEventListener('keyup', handleKeyUp, { capture: true })
	window.addEventListener('blur', releaseEverything)
	document.addEventListener('visibilitychange', handleHidden)
	void reconnectMidiQuietly()

	return () => {
		window.removeEventListener('keydown', handleKeyDown, { capture: true })
		window.removeEventListener('keyup', handleKeyUp, { capture: true })
		window.removeEventListener('blur', releaseEverything)
		document.removeEventListener('visibilitychange', handleHidden)
		releaseEverything()
	}
}
