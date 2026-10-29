import { Mp3Encoder } from '@breezystack/lamejs'

// Turns decoded audio into an MP3, off the main thread so
// the page stays smooth. Gets raw samples, sends back
// progress and then the finished file's bytes.

export type EncodeRequestT = {
	channels: Float32Array[]
	sampleRate: number
	kbps: number
}

export type EncodeMessageT = { kind: 'progress'; ratio: number } | { kind: 'done'; chunks: Uint8Array<ArrayBuffer>[] }

// Encoder frames are 1152 samples. A batch of them keeps
// progress messages few.
const samplesPerBatch = 1152 * 64

const toPcm16 = (samples: Float32Array): Int16Array => {
	const pcm = new Int16Array(samples.length)

	for (const [index, sample] of samples.entries()) {
		const clamped = Math.max(-1, Math.min(1, sample))
		const scale = clamped < 0 ? 0x8000 : 0x7fff
		pcm[index] = clamped * scale
	}

	return pcm
}

const buildBatchStarts = (sampleCount: number): number[] => {
	const batchCount = Math.ceil(sampleCount / samplesPerBatch)
	return Array.from({ length: batchCount }, (_, batchIndex) => batchIndex * samplesPerBatch)
}

const encode = (request: EncodeRequestT) => {
	const left = toPcm16(request.channels[0])
	const hasRight = request.channels.length > 1
	const right = hasRight ? toPcm16(request.channels[1]) : undefined
	const channelCount = hasRight ? 2 : 1
	const encoder = new Mp3Encoder(channelCount, request.sampleRate, request.kbps)
	const chunks: Uint8Array<ArrayBuffer>[] = []
	const batchStarts = buildBatchStarts(left.length)

	for (const start of batchStarts) {
		const end = start + samplesPerBatch
		const leftBatch = left.subarray(start, end)
		const rightBatch = right?.subarray(start, end)
		const encoded = encoder.encodeBuffer(leftBatch, rightBatch)
		const hasBytes = encoded.length > 0
		if (hasBytes) chunks.push(new Uint8Array(encoded))
		const ratio = Math.min(1, end / left.length)
		const progress: EncodeMessageT = { kind: 'progress', ratio }
		self.postMessage(progress)
	}

	const tail = encoder.flush()
	const hasTail = tail.length > 0
	if (hasTail) chunks.push(new Uint8Array(tail))
	const done: EncodeMessageT = { kind: 'done', chunks }
	self.postMessage(done)
}

const handleMessage = (event: MessageEvent<EncodeRequestT>) => encode(event.data)

self.addEventListener('message', handleMessage)
