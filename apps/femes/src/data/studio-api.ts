import type { ArtistT, FemesTrackT, PlaylistT, SocialLinkT, VisibilityT } from './types'

// Every call the Studio makes. Each throws a StudioError
// with the server's reason when it fails.

export type MeT = {
	email: string
	artist: ArtistT | null
}

export type StudioDataT = {
	artist: ArtistT
	tracks: FemesTrackT[]
	playlists: PlaylistT[]
}

export type UploadKindT = 'audio' | 'image'

export type StudioErrorT = Error & {
	reason: string
	status: number
}

const createStudioError = (reason: string, status: number): StudioErrorT => {
	const error = new Error(`femes: ${reason} (${status})`) as StudioErrorT
	error.reason = reason
	error.status = status
	return error
}

export const checkIsStudioError = (value: unknown): value is StudioErrorT => {
	const isError = value instanceof Error
	return isError && 'reason' in value
}

// The server's reason, or "unknown" for anything else,
// like a dropped connection.
export const getErrorReason = (value: unknown): string => {
	const isStudioError = checkIsStudioError(value)
	if (isStudioError) return value.reason
	return 'unknown'
}

const readReason = async (response: Response): Promise<string> => {
	try {
		const body = (await response.json()) as { error?: string }
		return body.error ?? 'unknown'
	} catch {
		return 'unknown'
	}
}

const callApi = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
	const hasBody = body !== undefined
	const headers = hasBody ? { 'content-type': 'application/json' } : undefined
	const payload = hasBody ? JSON.stringify(body) : undefined
	const response = await fetch(path, { method, headers, body: payload, credentials: 'same-origin' })
	const isEmpty = response.status === 204
	if (response.ok && isEmpty) return undefined as T
	if (response.ok) return (await response.json()) as T
	const reason = await readReason(response)
	throw createStudioError(reason, response.status)
}

// ---------- signing in ----------

// Undefined when signed out.
export const getMe = async (): Promise<MeT | undefined> => {
	try {
		return await callApi<MeT>('GET', '/api/me')
	} catch (meError) {
		const isSignedOut = checkIsStudioError(meError) && meError.status === 401
		if (isSignedOut) return undefined
		throw meError
	}
}

export const requestSignInLink = (email: string) => callApi<{ sent: boolean; devLink?: string }>('POST', '/api/auth/request', { email })
export const signOut = () => callApi<void>('POST', '/api/auth/signout')

// ---------- artist ----------

export const getStudio = () => callApi<StudioDataT>('GET', '/api/studio')
export const createArtist = (name: string, slug: string) => callApi<{ artist: ArtistT }>('POST', '/api/studio/artist', { name, slug })

export type ArtistChangesT = {
	name?: string
	slug?: string
	bio?: string
	links?: SocialLinkT[]
	avatarKey?: string
	headerKey?: string
}

export const updateArtist = (changes: ArtistChangesT) => callApi<{ artist: ArtistT }>('PATCH', '/api/studio/artist', changes)

// ---------- tracks ----------

export type TrackChangesT = {
	title?: string
	genre?: string
	description?: string
	visibility?: VisibilityT
	artworkKey?: string
}

export const createTrack = (title: string, audioKey: string, duration: number) => {
	return callApi<{ track: FemesTrackT }>('POST', '/api/studio/tracks', { title, audioKey, duration })
}

export const updateTrack = (trackId: string, changes: TrackChangesT) => {
	return callApi<{ track: FemesTrackT }>('PATCH', `/api/studio/tracks/${trackId}`, changes)
}

export const deleteTrack = (trackId: string) => callApi<{ deleted: string }>('DELETE', `/api/studio/tracks/${trackId}`)
export const reorderTracks = (ids: string[]) => callApi<{ ok: boolean }>('PUT', '/api/studio/tracks/order', { ids })

// ---------- playlists ----------

export type PlaylistChangesT = {
	name?: string
	description?: string
	visibility?: VisibilityT
	coverKey?: string
}

export const createPlaylist = (changes: PlaylistChangesT) => callApi<{ playlist: PlaylistT }>('POST', '/api/studio/playlists', changes)
export const updatePlaylist = (playlistId: string, changes: PlaylistChangesT) => callApi<{ ok: boolean }>('PATCH', `/api/studio/playlists/${playlistId}`, changes)
export const deletePlaylist = (playlistId: string) => callApi<{ deleted: string }>('DELETE', `/api/studio/playlists/${playlistId}`)

export const setPlaylistTracks = (playlistId: string, ids: string[]) => {
	return callApi<{ trackIds: string[] }>('PUT', `/api/studio/playlists/${playlistId}/tracks`, { ids })
}

// ---------- uploads ----------

type StartedUploadT = {
	key: string
	uploadId?: string
	partSize?: number
}

type UploadedPartT = {
	partNumber: number
	etag: string
}

const sendBody = async (path: string, body: Blob, contentType: string): Promise<Response> => {
	const response = await fetch(path, { method: 'PUT', headers: { 'content-type': contentType }, body, credentials: 'same-origin' })
	if (response.ok) return response
	const reason = await readReason(response)
	throw createStudioError(reason, response.status)
}

const uploadParts = async (file: File, started: StartedUploadT, handleProgress: (ratio: number) => void) => {
	const partSize = started.partSize as number
	const partCount = Math.max(1, Math.ceil(file.size / partSize))
	const partNumbers = Array.from({ length: partCount }, (_, index) => index + 1)
	const parts: UploadedPartT[] = []

	for (const partNumber of partNumbers) {
		const start = (partNumber - 1) * partSize
		const chunk = file.slice(start, start + partSize)
		const query = new URLSearchParams({ key: started.key, uploadId: started.uploadId as string, part: String(partNumber) })
		const response = await sendBody(`/api/studio/uploads/part?${query}`, chunk, 'application/octet-stream')
		const uploadedPart = (await response.json()) as UploadedPartT
		parts.push(uploadedPart)
		handleProgress(partNumber / partCount)
	}

	return parts
}

// Puts a file in storage and returns its key. Audio goes
// up in parts so large WAVs work; images go whole.
export const uploadFile = async (file: File, kind: UploadKindT, handleProgress: (ratio: number) => void): Promise<string> => {
	const startInput = { kind, contentType: file.type, size: file.size }
	const started = await callApi<StartedUploadT>('POST', '/api/studio/uploads', startInput)
	const isImage = kind === 'image'

	if (isImage) {
		const query = new URLSearchParams({ key: started.key })
		await sendBody(`/api/studio/uploads/file?${query}`, file, file.type)
		handleProgress(1)
		return started.key
	}

	const parts = await uploadParts(file, started, handleProgress)
	await callApi('POST', '/api/studio/uploads/complete', { key: started.key, uploadId: started.uploadId, parts })
	return started.key
}

// Reads a file's length before upload, so the player
// can show it before the audio loads.
export const readAudioDuration = (file: File): Promise<number> => {
	const objectUrl = URL.createObjectURL(file)
	const audio = new Audio()
	audio.preload = 'metadata'

	return new Promise((resolve) => {
		const finish = (seconds: number) => {
			URL.revokeObjectURL(objectUrl)
			resolve(seconds)
		}

		const handleMetadata = () => {
			const isKnown = Number.isFinite(audio.duration)
			const seconds = isKnown ? audio.duration : 0
			finish(seconds)
		}

		const handleError = () => finish(0)
		audio.addEventListener('loadedmetadata', handleMetadata)
		audio.addEventListener('error', handleError)
		audio.src = objectUrl
	})
}

// "safeword_master_v4.wav" becomes "safeword master v4".
export const buildTitleFromFileName = (fileName: string): string => {
	const withoutExtension = fileName.replace(/\.[^.]+$/, '')
	return withoutExtension.replace(/[_-]+/g, ' ').trim()
}
