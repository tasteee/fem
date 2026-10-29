import type { EncodeMessageT, EncodeRequestT } from './mp3-encoder.worker'
import { readAudioDuration } from './studio-api'

// Every upload becomes an MP3 in the browser first, so
// artists can drop in a WAV, an M4A, or even a video and
// storage only ever holds small files. MP3s go up as they
// are; encoding them again would only lose quality.

const targetSampleRate = 44100
const targetKbps = 256

export type PreparedAudioT = {
	file: File
	duration: number
}

export type ConvertProgressT = (ratio: number) => void

const checkIsMp3 = (file: File): boolean => {
	const isMp3Type = file.type === 'audio/mpeg' || file.type === 'audio/mp3'
	const hasMp3Name = /\.mp3$/i.test(file.name)
	return isMp3Type || hasMp3Name
}

const buildMp3Name = (fileName: string): string => {
	const baseName = fileName.replace(/\.[^.]+$/, '')
	return `${baseName}.mp3`
}

// The browser's own decoder reads WAV, AIFF, FLAC, M4A,
// AAC, and the audio track of most videos. An offline
// context decodes without making a sound, at a standard
// sample rate.
const decodeAudio = async (file: File): Promise<AudioBuffer> => {
	const bytes = await file.arrayBuffer()
	const context = new OfflineAudioContext(2, 1, targetSampleRate)

	try {
		return await context.decodeAudioData(bytes)
	} catch (decodeError) {
		console.warn('femes: could not decode', file.name, decodeError)
		throw new Error('unreadable-audio')
	}
}

const readChannels = (buffer: AudioBuffer): Float32Array[] => {
	const channelCount = Math.min(2, buffer.numberOfChannels)
	const channelIndexes = Array.from({ length: channelCount }, (_, channelIndex) => channelIndex)
	return channelIndexes.map((channelIndex) => buffer.getChannelData(channelIndex))
}

const encodeInWorker = (request: EncodeRequestT, handleProgress: ConvertProgressT): Promise<Uint8Array<ArrayBuffer>[]> => {
	const worker = new Worker(new URL('./mp3-encoder.worker.ts', import.meta.url), { type: 'module' })

	return new Promise((resolve, reject) => {
		const handleMessage = (event: MessageEvent<EncodeMessageT>) => {
			const message = event.data
			const isProgress = message.kind === 'progress'
			if (isProgress) return handleProgress(message.ratio)
			worker.terminate()
			resolve(message.chunks)
		}

		const handleError = (workerError: ErrorEvent) => {
			worker.terminate()
			console.error('femes: mp3 encoding failed', workerError.message)
			reject(new Error('conversion-failed'))
		}

		worker.addEventListener('message', handleMessage)
		worker.addEventListener('error', handleError)
		const transfers = request.channels.map((channel) => channel.buffer)
		worker.postMessage(request, transfers)
	})
}

// Audio types the server takes as they are, for the
// rare browser that can't decode one itself.
const storableTypes = ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/flac', 'audio/x-flac', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg']
const maxStoredBytes = 200 * 1024 * 1024

const checkCanStoreAsIs = (file: File): boolean => {
	const isStorableType = storableTypes.includes(file.type)
	const isSmallEnough = file.size <= maxStoredBytes
	return isStorableType && isSmallEnough
}

const keepAsIs = async (file: File, handleProgress: ConvertProgressT): Promise<PreparedAudioT> => {
	handleProgress(1)
	const duration = await readAudioDuration(file)
	return { file, duration }
}

// Decodes, or gives up quietly when the file can go up
// unconverted. A video this browser can't read has no
// such fallback.
const decodeOrUndefined = async (file: File): Promise<AudioBuffer | undefined> => {
	try {
		return await decodeAudio(file)
	} catch (decodeError) {
		const canStoreAsIs = checkCanStoreAsIs(file)
		if (canStoreAsIs) return undefined
		throw decodeError
	}
}

export const prepareAudioUpload = async (file: File, handleProgress: ConvertProgressT): Promise<PreparedAudioT> => {
	const isMp3 = checkIsMp3(file)
	if (isMp3) return keepAsIs(file, handleProgress)
	const buffer = await decodeOrUndefined(file)
	if (!buffer) return keepAsIs(file, handleProgress)
	// The decoded samples are copied, so the worker can own
	// them without detaching the AudioBuffer's memory.
	const channels = readChannels(buffer).map((channel) => channel.slice())
	const request = { channels, sampleRate: buffer.sampleRate, kbps: targetKbps }
	const chunks = await encodeInWorker(request, handleProgress)
	const mp3File = new File(chunks, buildMp3Name(file.name), { type: 'audio/mpeg' })
	return { file: mp3File, duration: buffer.duration }
}
