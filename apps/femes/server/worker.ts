import { checkIsSameOrigin, getSessionEmail, handleRequestLink, handleSignOut, handleVerifyLink } from './auth'
import type { EnvT } from './env'
import { handleMedia } from './media'
import { serveAppPage } from './meta'
import { ensureSchema } from './schema'
import { handleArtistPage, handlePlaylistPage, handleTrackPage } from './public-api'
import { respondError, respondJson, respondMissing } from './respond'
import * as studio from './studio'
import { handleCompleteUpload, handleStartUpload, handleUploadFile, handleUploadPart } from './uploads'

// The whole femes server. Pages runs it for every
// request: the API, media, then the app's files, with
// every other path falling back to the app.

const getSegments = (pathname: string): string[] => {
	const parts = pathname.split('/').filter((part) => part !== '')
	return parts.map((part) => decodeURIComponent(part))
}

// ---------- public ----------

// /api/artists/:artist
// /api/artists/:artist/tracks/:track
// /api/artists/:artist/playlists/:playlist
const handlePublic = (env: EnvT, segments: string[]): Promise<Response> | Response => {
	const artistSlug = (segments[2] ?? '').toLowerCase()
	const section = segments[3]
	const itemSlug = (segments[4] ?? '').toLowerCase()
	const isArtist = segments.length === 3
	if (isArtist) return handleArtistPage(env, artistSlug)
	const isTrack = section === 'tracks' && segments.length === 5
	if (isTrack) return handleTrackPage(env, artistSlug, itemSlug)
	const isPlaylist = section === 'playlists' && segments.length === 5
	if (isPlaylist) return handlePlaylistPage(env, artistSlug, itemSlug)
	return respondMissing()
}

// Shows whether the dashboard bindings reach the worker.
const handleHealth = async (env: EnvT): Promise<Response> => {
	const hasDatabase = Boolean(env.DB)
	const hasMedia = Boolean(env.MEDIA)
	const tablesResult = hasDatabase ? await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all<{ name: string }>() : undefined
	const tables = tablesResult?.results.map((row) => row.name) ?? []
	const canEmail = Boolean(env.RESEND_API_KEY) && Boolean(env.MAIL_FROM)
	return respondJson({ database: hasDatabase, media: hasMedia, tables, email: canEmail })
}

// ---------- signed in ----------

// /api/studio/...: the artist's own things.
const handleStudio = async (request: Request, env: EnvT, segments: string[], email: string): Promise<Response> => {
	const method = request.method
	const area = segments[2]
	const itemId = segments[3] ?? ''
	const action = segments[4]
	const isArtistCreate = area === 'artist' && method === 'POST'
	if (isArtistCreate) return studio.handleCreateArtist(request, env, email)

	const artist = await studio.findArtistByEmail(env, email)
	if (!artist) return respondError(409, 'no-artist')

	const isOverview = segments.length === 2 && method === 'GET'
	if (isOverview) return studio.handleStudio(env, artist)
	const isArtistUpdate = area === 'artist' && method === 'PATCH'
	if (isArtistUpdate) return studio.handleUpdateArtist(request, env, artist)

	const isUploads = area === 'uploads'
	const isUploadStart = isUploads && segments.length === 3 && method === 'POST'
	if (isUploadStart) return handleStartUpload(request, env, artist)
	const isUploadFile = isUploads && itemId === 'file' && method === 'PUT'
	if (isUploadFile) return handleUploadFile(request, env, artist)
	const isUploadPart = isUploads && itemId === 'part' && method === 'PUT'
	if (isUploadPart) return handleUploadPart(request, env, artist)
	const isUploadComplete = isUploads && itemId === 'complete' && method === 'POST'
	if (isUploadComplete) return handleCompleteUpload(request, env, artist)

	const isTracks = area === 'tracks'
	const isTrackCreate = isTracks && segments.length === 3 && method === 'POST'
	if (isTrackCreate) return studio.handleCreateTrack(request, env, artist)
	const isTrackOrder = isTracks && itemId === 'order' && method === 'PUT'
	if (isTrackOrder) return studio.handleReorderTracks(request, env, artist)
	const isTrackUpdate = isTracks && itemId !== '' && method === 'PATCH'
	if (isTrackUpdate) return studio.handleUpdateTrack(request, env, artist, itemId)
	const isTrackDelete = isTracks && itemId !== '' && method === 'DELETE'
	if (isTrackDelete) return studio.handleDeleteTrack(env, artist, itemId)

	const isPlaylists = area === 'playlists'
	const isPlaylistCreate = isPlaylists && segments.length === 3 && method === 'POST'
	if (isPlaylistCreate) return studio.handleCreatePlaylist(request, env, artist)
	const isPlaylistTracks = isPlaylists && action === 'tracks' && method === 'PUT'
	if (isPlaylistTracks) return studio.handleSetPlaylistTracks(request, env, artist, itemId)
	const isPlaylistUpdate = isPlaylists && itemId !== '' && method === 'PATCH'
	if (isPlaylistUpdate) return studio.handleUpdatePlaylist(request, env, artist, itemId)
	const isPlaylistDelete = isPlaylists && itemId !== '' && method === 'DELETE'
	if (isPlaylistDelete) return studio.handleDeletePlaylist(env, artist, itemId)

	return respondMissing()
}

const handleSignedIn = async (request: Request, env: EnvT, segments: string[]): Promise<Response> => {
	const isWrite = request.method !== 'GET'
	const isForeignWrite = isWrite && !checkIsSameOrigin(request)
	if (isForeignWrite) return respondError(403, 'cross-site')
	const email = await getSessionEmail(request, env)
	if (!email) return respondError(401, 'signed-out')
	const isMe = segments[1] === 'me'
	if (isMe) return studio.handleMe(env, email)
	return handleStudio(request, env, segments, email)
}

// ---------- routing ----------

const handleApi = async (request: Request, env: EnvT, segments: string[]): Promise<Response> => {
	const area = segments[1]
	const method = request.method
	const isPublic = area === 'artists' && method === 'GET'
	if (isPublic) return handlePublic(env, segments)
	const isHealth = area === 'health'
	if (isHealth) return handleHealth(env)

	const isAuth = area === 'auth'
	const authAction = segments[2]
	const isLinkRequest = isAuth && authAction === 'request' && method === 'POST' && checkIsSameOrigin(request)
	if (isLinkRequest) return handleRequestLink(request, env)
	const isVerify = isAuth && authAction === 'verify' && method === 'GET'
	if (isVerify) return handleVerifyLink(request, env)
	const isSignOut = isAuth && authAction === 'signout' && method === 'POST' && checkIsSameOrigin(request)
	if (isSignOut) return handleSignOut(request, env)

	const isSignedInArea = area === 'me' || area === 'studio'
	if (isSignedInArea) return handleSignedIn(request, env, segments)
	return respondMissing()
}

// A path with a dot is a file. Anything else is a page,
// and every page is the app.
const handleAsset = async (request: Request, env: EnvT, pathname: string): Promise<Response> => {
	const lastSegment = pathname.split('/').pop() ?? ''
	const looksLikeFile = lastSegment.includes('.')
	if (looksLikeFile) return env.ASSETS.fetch(request)
	const appUrl = new URL('/', request.url)
	const appResponse = await env.ASSETS.fetch(new Request(appUrl, request))
	await ensureSchema(env)
	return serveAppPage(request, env, appResponse)
}

const handleRequest = async (request: Request, env: EnvT): Promise<Response> => {
	const url = new URL(request.url)
	const segments = getSegments(url.pathname)
	const area = segments[0]
	const isApi = area === 'api'

	if (isApi) {
		await ensureSchema(env)
		return handleApi(request, env, segments)
	}

	const isMedia = area === 'media' && segments.length > 1
	if (isMedia) return handleMedia(request, env, segments.slice(1).join('/'))
	return handleAsset(request, env, url.pathname)
}

export default {
	fetch: async (request: Request, env: EnvT): Promise<Response> => {
		try {
			return await handleRequest(request, env)
		} catch (requestError) {
			console.error('femes: request failed', requestError)
			return new Response('Something went wrong', { status: 500 })
		}
	}
}
