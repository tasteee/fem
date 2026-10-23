import { createId } from './crypto'
import type { EnvT } from './env'
import { readJson, respondError, respondJson } from './respond'
import type { ArtistRowT } from './rows'

// Files go straight into R2 under the artist's own
// folder. Audio goes up in parts, because one request is
// capped at 100 MB on Cloudflare's free plan.

export type UploadKindT = 'audio' | 'image'

const megabyte = 1024 * 1024
export const audioPartSize = 20 * megabyte
const maxBytes: Record<UploadKindT, number> = { audio: 200 * megabyte, image: 15 * megabyte }

const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/flac', 'audio/x-flac', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg']
const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

const extensionByType: Record<string, string> = {
	'audio/mpeg': 'mp3',
	'audio/mp3': 'mp3',
	'audio/wav': 'wav',
	'audio/x-wav': 'wav',
	'audio/wave': 'wav',
	'audio/flac': 'flac',
	'audio/x-flac': 'flac',
	'audio/mp4': 'm4a',
	'audio/x-m4a': 'm4a',
	'audio/aac': 'aac',
	'audio/ogg': 'ogg',
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/avif': 'avif'
}

export const buildArtistFolder = (artist: ArtistRowT): string => `artists/${artist.id}/`

// A key from the browser is only trusted when it sits in
// this artist's folder.
export const checkOwnsKey = (artist: ArtistRowT, key: string): boolean => {
	const isInFolder = key.startsWith(buildArtistFolder(artist))
	const hasNoClimbing = !key.includes('..')
	return isInFolder && hasNoClimbing
}

type StartUploadInputT = {
	kind?: UploadKindT
	contentType?: string
	size?: number
}

const checkIsAllowedType = (kind: UploadKindT, contentType: string): boolean => {
	const allowedTypes = kind === 'audio' ? audioTypes : imageTypes
	return allowedTypes.includes(contentType)
}

export const handleStartUpload = async (request: Request, env: EnvT, artist: ArtistRowT): Promise<Response> => {
	const input = await readJson<StartUploadInputT>(request)
	const kind = input?.kind
	const contentType = (input?.contentType ?? '').toLowerCase()
	const size = input?.size ?? 0
	const isKnownKind = kind === 'audio' || kind === 'image'
	if (!isKnownKind) return respondError(400, 'invalid-kind')
	const isAllowedType = checkIsAllowedType(kind, contentType)
	if (!isAllowedType) return respondError(415, 'unsupported-type')
	const isTooLarge = size > maxBytes[kind]
	if (isTooLarge) return respondError(413, 'too-large')

	const extension = extensionByType[contentType]
	const key = `${buildArtistFolder(artist)}${kind}/${createId('file')}.${extension}`
	const isImage = kind === 'image'
	if (isImage) return respondJson({ key })

	const multipart = await env.MEDIA.createMultipartUpload(key, { httpMetadata: { contentType } })
	return respondJson({ key, uploadId: multipart.uploadId, partSize: audioPartSize })
}

// One image, sent whole.
export const handleUploadFile = async (request: Request, env: EnvT, artist: ArtistRowT): Promise<Response> => {
	const url = new URL(request.url)
	const key = url.searchParams.get('key') ?? ''
	const isOwned = checkOwnsKey(artist, key)
	if (!isOwned) return respondError(403, 'not-yours')
	const contentType = request.headers.get('content-type') ?? ''
	const isAllowedType = checkIsAllowedType('image', contentType)
	if (!isAllowedType) return respondError(415, 'unsupported-type')
	const length = Number(request.headers.get('content-length') ?? 0)
	const isTooLarge = length > maxBytes.image
	if (isTooLarge) return respondError(413, 'too-large')
	await env.MEDIA.put(key, request.body, { httpMetadata: { contentType } })
	return respondJson({ key })
}

// One part of an audio file.
export const handleUploadPart = async (request: Request, env: EnvT, artist: ArtistRowT): Promise<Response> => {
	const url = new URL(request.url)
	const key = url.searchParams.get('key') ?? ''
	const uploadId = url.searchParams.get('uploadId') ?? ''
	const partNumber = Number(url.searchParams.get('part'))
	const isOwned = checkOwnsKey(artist, key)
	if (!isOwned) return respondError(403, 'not-yours')
	const isValidPart = Number.isInteger(partNumber) && partNumber >= 1 && partNumber <= 10
	if (!isValidPart) return respondError(400, 'invalid-part')
	const hasBody = request.body !== null
	if (!hasBody) return respondError(400, 'empty-part')
	const multipart = env.MEDIA.resumeMultipartUpload(key, uploadId)
	const uploadedPart = await multipart.uploadPart(partNumber, request.body)
	return respondJson(uploadedPart)
}

type CompleteUploadInputT = {
	key?: string
	uploadId?: string
	parts?: R2UploadedPart[]
}

export const handleCompleteUpload = async (request: Request, env: EnvT, artist: ArtistRowT): Promise<Response> => {
	const input = await readJson<CompleteUploadInputT>(request)
	const key = input?.key ?? ''
	const isOwned = checkOwnsKey(artist, key)
	if (!isOwned) return respondError(403, 'not-yours')
	const parts = input?.parts ?? []
	const hasParts = parts.length > 0
	if (!hasParts) return respondError(400, 'no-parts')
	const multipart = env.MEDIA.resumeMultipartUpload(key, input?.uploadId ?? '')
	await multipart.complete(parts)
	return respondJson({ key })
}

// Removes files that belonged to a deleted or replaced
// item. Empty keys are skipped.
export const deleteKeys = async (env: EnvT, keys: string[]) => {
	const realKeys = keys.filter((key) => key !== '')
	const hasKeys = realKeys.length > 0
	if (!hasKeys) return
	await env.MEDIA.delete(realKeys)
}
