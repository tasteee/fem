import type { EnvT } from './env'

// Streams a file from R2. Audio players ask for byte
// ranges to seek, so ranges are honored.

const oneYearSeconds = 31536000

type ByteRangeT = { offset: number; length?: number } | { suffix: number }

const parseRange = (header: string | null): ByteRangeT | undefined => {
	if (!header) return undefined
	const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
	if (!match) return undefined
	const startText = match[1]
	const endText = match[2]
	const hasStart = startText !== ''
	const hasEnd = endText !== ''
	const isSuffix = !hasStart && hasEnd
	if (isSuffix) return { suffix: Number(endText) }
	if (!hasStart) return undefined
	const offset = Number(startText)
	if (!hasEnd) return { offset }
	const length = Number(endText) - offset + 1
	return { offset, length }
}

const getServedRange = (object: R2ObjectBody) => {
	const range = object.range as { offset?: number; length?: number; suffix?: number } | undefined
	const totalSize = object.size
	const hasSuffix = range?.suffix !== undefined
	const suffixLength = range?.suffix ?? 0
	const offset = hasSuffix ? totalSize - suffixLength : (range?.offset ?? 0)
	const length = hasSuffix ? suffixLength : (range?.length ?? totalSize - offset)
	return { offset, length, totalSize }
}

export const handleMedia = async (request: Request, env: EnvT, key: string): Promise<Response> => {
	const range = parseRange(request.headers.get('range'))
	const options = range ? { range } : {}
	const object = await env.MEDIA.get(key, options)
	if (!object) return new Response('Not found', { status: 404 })

	const headers = new Headers()
	object.writeHttpMetadata(headers)
	headers.set('etag', object.httpEtag)
	headers.set('accept-ranges', 'bytes')
	// Keys never change content; a new upload gets a new key.
	headers.set('cache-control', `public, max-age=${oneYearSeconds}, immutable`)

	if (!range) {
		headers.set('content-length', String(object.size))
		return new Response(object.body, { status: 200, headers })
	}

	const served = getServedRange(object)
	const lastByte = served.offset + served.length - 1
	headers.set('content-range', `bytes ${served.offset}-${lastByte}/${served.totalSize}`)
	headers.set('content-length', String(served.length))
	return new Response(object.body, { status: 206, headers })
}
