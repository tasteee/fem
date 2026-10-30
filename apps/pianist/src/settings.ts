import type { CustomParamsT } from './music/layouts'
import { layouts } from './music/layouts'
import { roots } from './music/notes'
import { scales } from './music/scales'

export type SettingsT = {
	root: string
	scale: string
	octave: number
	volume: number
	layout: string
	custom: CustomParamsT
	seed: number
	// 'builtin' or a MIDI port id.
	output: string
}

export const storageKey = 'pianist:settings'

export const octaveRange = { min: 1, max: 6 }
export const stepRange = { min: -7, max: 14 }

const newSeed = () => Math.floor(Math.random() * 2 ** 31)

export const defaultSettings = (): SettingsT => ({
	root: 'C',
	scale: 'major',
	octave: 3,
	volume: 0.8,
	layout: 'standard',
	custom: { rowStep: 7, colStep: 1 },
	seed: newSeed(),
	output: 'builtin'
})

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
	const number = Number(value)
	return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback
}

const pick = (value: unknown, ids: string[], fallback: string) => (ids.includes(String(value)) ? String(value) : fallback)

// Anything stored that looks wrong falls back to its
// default, one field at a time.
export const readSettings = (raw: unknown): SettingsT => {
	const defaults = defaultSettings()
	const data = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, any>
	const custom = (typeof data.custom === 'object' && data.custom !== null ? data.custom : {}) as Record<string, unknown>
	const volume = Number(data.volume)

	return {
		root: pick(
			data.root,
			roots.map((root) => root.id),
			defaults.root
		),
		scale: pick(
			data.scale,
			scales.map((scale) => scale.id),
			defaults.scale
		),
		octave: clamp(data.octave, octaveRange.min, octaveRange.max, defaults.octave),
		volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : defaults.volume,
		layout: pick(
			data.layout,
			layouts.map((layout) => layout.id),
			defaults.layout
		),
		custom: {
			rowStep: clamp(custom.rowStep, stepRange.min, stepRange.max, defaults.custom.rowStep),
			colStep: clamp(custom.colStep, -4, 4, defaults.custom.colStep)
		},
		seed: clamp(data.seed, 0, 2 ** 31, defaults.seed),
		output: typeof data.output === 'string' && data.output !== '' ? data.output : defaults.output
	}
}

export const loadSettings = (): SettingsT => {
	try {
		const stored = localStorage.getItem(storageKey)
		return readSettings(stored ? JSON.parse(stored) : undefined)
	} catch {
		return defaultSettings()
	}
}

export const saveSettings = (settings: SettingsT) => {
	try {
		localStorage.setItem(storageKey, JSON.stringify(settings))
	} catch {
		// Storage can be blocked. The app still works.
	}
}

export const rerollSeed = newSeed
