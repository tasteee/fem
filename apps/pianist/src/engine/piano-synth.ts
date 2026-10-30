import type { NoteOutputT } from './engine'

type VoiceT = { stop: (releaseSeconds: number) => void }

const partialCount = 7

const midiToFrequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

// Low strings ring long, high ones fade fast.
const getSustainSeconds = (midi: number) => Math.min(9, Math.max(1.2, 5 * 2 ** (-(midi - 60) / 20)))

const makeNoise = (context: AudioContext) => {
	const length = Math.floor(context.sampleRate * 0.03)
	const buffer = context.createBuffer(1, length, context.sampleRate)
	const data = buffer.getChannelData(0)
	for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / length)
	return buffer
}

// A small additive piano: a few string partials that
// each fade on their own clock, a hammer tick, and a
// brightness that follows how hard the key is hit. No
// sample files to load.
export const createPianoSynth = (): NoteOutputT & { setVolume: (volume: number) => void } => {
	let context: AudioContext | undefined
	let master: GainNode | undefined
	let noise: AudioBuffer | undefined
	let volume = 0.8
	const voices = new Map<number, VoiceT>()

	const ensureContext = () => {
		if (context) {
			if (context.state === 'suspended') void context.resume()
			return context
		}
		context = new AudioContext()
		master = context.createGain()
		master.gain.value = volume * volume
		const compressor = context.createDynamicsCompressor()
		master.connect(compressor)
		compressor.connect(context.destination)
		noise = makeNoise(context)
		return context
	}

	const stopVoice = (midi: number, releaseSeconds: number) => {
		const voice = voices.get(midi)
		if (!voice) return
		voices.delete(midi)
		voice.stop(releaseSeconds)
	}

	const noteOn = (midi: number, velocity: number) => {
		const audio = ensureContext()
		if (!master) return
		stopVoice(midi, 0.05)
		const now = audio.currentTime
		const level = (velocity / 127) ** 1.4
		const frequency = midiToFrequency(midi)
		const sustain = getSustainSeconds(midi)
		const inharmonicity = 0.00012 * 2 ** ((midi - 60) / 12)

		const voiceGain = audio.createGain()
		voiceGain.gain.setValueAtTime(0, now)
		voiceGain.gain.linearRampToValueAtTime(level * 0.35, now + 0.004)

		const tone = audio.createBiquadFilter()
		tone.type = 'lowpass'
		tone.frequency.value = Math.min(18000, frequency * (3 + level * 9))
		voiceGain.connect(tone)
		tone.connect(master)

		const sources: AudioScheduledSourceNode[] = []

		for (let partial = 1; partial <= partialCount; partial += 1) {
			const partialFrequency = frequency * partial * Math.sqrt(1 + inharmonicity * partial * partial)
			if (partialFrequency > 14000) break
			const partialGain = audio.createGain()
			const peak = 1 / partial ** 1.15
			const decay = sustain / (1 + 0.55 * (partial - 1))
			partialGain.gain.setValueAtTime(peak, now)
			partialGain.gain.setTargetAtTime(0, now + 0.01, decay / 3)
			partialGain.connect(voiceGain)

			// Two strings, a hair apart, so the note breathes.
			const detunes = partial === 1 ? [-1.5, 1.5] : [0]
			detunes.forEach((detune) => {
				const oscillator = audio.createOscillator()
				oscillator.frequency.value = partialFrequency
				oscillator.detune.value = detune
				oscillator.connect(partialGain)
				oscillator.start(now)
				sources.push(oscillator)
			})
		}

		if (noise) {
			const tick = audio.createBufferSource()
			tick.buffer = noise
			const tickFilter = audio.createBiquadFilter()
			tickFilter.type = 'bandpass'
			tickFilter.frequency.value = Math.min(6000, frequency * 4)
			const tickGain = audio.createGain()
			tickGain.gain.value = level * 0.5
			tick.connect(tickFilter)
			tickFilter.connect(tickGain)
			tickGain.connect(voiceGain)
			tick.start(now)
			sources.push(tick)
		}

		const stop = (releaseSeconds: number) => {
			const at = audio.currentTime
			voiceGain.gain.cancelScheduledValues(at)
			voiceGain.gain.setValueAtTime(voiceGain.gain.value, at)
			voiceGain.gain.setTargetAtTime(0, at, releaseSeconds / 3)
			sources.forEach((source) => source.stop(at + releaseSeconds * 2 + 0.1))
			sources[0].addEventListener('ended', () => voiceGain.disconnect())
		}

		voices.set(midi, { stop })
	}

	const noteOff = (midi: number) => stopVoice(midi, 0.25)

	const allOff = () => {
		;[...voices.keys()].forEach((midi) => stopVoice(midi, 0.08))
	}

	const setVolume = (next: number) => {
		volume = next
		if (master) master.gain.value = next * next
	}

	return { noteOn, noteOff, allOff, setVolume }
}
