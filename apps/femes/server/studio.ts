import { buildSlug, reservedSlugs } from '../src/routing/routes'
import { createId } from './crypto'
import type { EnvT } from './env'
import { readJson, respondError, respondJson, respondMissing } from './respond'
import { toArtist, toPlaylist, toTrack } from './rows'
import type { ArtistRowT, PlaylistRowT, TrackRowT } from './rows'
import { visiblePlaylistTrack } from './public-api'
import { listFollowingIds, listPlaylistGuestTracks, listSavedTrackIds, listSavedTracks } from './social'
import { checkOwnsKey, deleteKeys } from './uploads'

// The artist's own workspace. Every handler here gets
// the signed-in artist's row, so an artist can only ever
// touch their own things.

type VisibilityT = 'public' | 'unlisted' | 'private'
const visibilities: VisibilityT[] = ['public', 'unlisted', 'private']
const maxTitleLength = 120
const maxBioLength = 160
const maxDescriptionLength = 1000
const maxLinks = 6

// ---------- shared ----------

const cleanText = (value: unknown, maxLength: number): string => {
	const text = typeof value === 'string' ? value.trim() : ''
	return text.slice(0, maxLength)
}

const checkIsVisibility = (value: unknown): value is VisibilityT => visibilities.includes(value as VisibilityT)

type SlugTableT = 'tracks' | 'playlists'

// "glass hours" twice becomes glass-hours, then
// glass-hours-2. The item being renamed doesn't block
// its own slug.
const findFreeSlug = async (env: EnvT, table: SlugTableT, artistId: string, name: string, ownId = '') => {
	const baseSlug = buildSlug(name) || 'untitled'
	const sql = `SELECT slug FROM ${table} WHERE artist_id = ? AND id != ? AND (slug = ? OR slug LIKE ?)`
	const result = await env.DB.prepare(sql).bind(artistId, ownId, baseSlug, `${baseSlug}-%`).all<{ slug: string }>()
	const takenSlugs = new Set(result.results.map((row) => row.slug))
	const isBaseFree = !takenSlugs.has(baseSlug)
	if (isBaseFree) return baseSlug
	// One more candidate than taken slugs always holds a
	// free one.
	const buildCandidate = (_: unknown, offset: number) => `${baseSlug}-${offset + 2}`
	const candidates = Array.from({ length: takenSlugs.size + 1 }, buildCandidate)
	const freeSlug = candidates.find((candidate) => !takenSlugs.has(candidate))
	return freeSlug as string
}

const recordOldSlug = async (env: EnvT, artistId: string, kind: 'track' | 'playlist', oldSlug: string, itemId: string) => {
	const sql = 'INSERT OR REPLACE INTO slug_history (artist_id, kind, old_slug, item_id) VALUES (?, ?, ?, ?)'
	await env.DB.prepare(sql).bind(artistId, kind, oldSlug, itemId).run()
}

const findTrackRow = (env: EnvT, artist: ArtistRowT, trackId: string) => {
	const sql = 'SELECT * FROM tracks WHERE id = ? AND artist_id = ?'
	return env.DB.prepare(sql).bind(trackId, artist.id).first<TrackRowT>()
}

const findPlaylistRow = (env: EnvT, artist: ArtistRowT, playlistId: string) => {
	const sql = 'SELECT * FROM playlists WHERE id = ? AND artist_id = ?'
	return env.DB.prepare(sql).bind(playlistId, artist.id).first<PlaylistRowT>()
}

// ---------- who am I ----------

export const findArtistByEmail = (env: EnvT, email: string) => {
	return env.DB.prepare('SELECT * FROM artists WHERE email = ?').bind(email).first<ArtistRowT>()
}

// Who is signed in, plus what they saved and follow, so
// public pages can show Save and Follow correctly.
export const handleMe = async (env: EnvT, email: string): Promise<Response> => {
	const row = await findArtistByEmail(env, email)
	if (!row) return respondJson({ email, artist: null, savedTrackIds: [], followingIds: [] })
	const savedTrackIds = await listSavedTrackIds(env, row.id)
	const followingIds = await listFollowingIds(env, row.id)
	return respondJson({ email, artist: toArtist(row), savedTrackIds, followingIds })
}

// ---------- the artist ----------

const validateArtistSlug = async (env: EnvT, slugInput: unknown, ownId: string): Promise<string | Response> => {
	const slug = buildSlug(cleanText(slugInput, 40))
	const isLongEnough = slug.length >= 2
	if (!isLongEnough) return respondError(400, 'slug-too-short')
	const isReserved = reservedSlugs.includes(slug)
	if (isReserved) return respondError(409, 'slug-taken')
	const sql = 'SELECT id FROM artists WHERE slug = ? AND id != ?'
	const takenRow = await env.DB.prepare(sql).bind(slug, ownId).first()
	if (takenRow) return respondError(409, 'slug-taken')
	return slug
}

type CreateArtistInputT = { name?: string; slug?: string }

// First visit: pick a name and a link.
export const handleCreateArtist = async (request: Request, env: EnvT, email: string): Promise<Response> => {
	const existing = await findArtistByEmail(env, email)
	if (existing) return respondError(409, 'already-exists')
	const input = await readJson<CreateArtistInputT>(request)
	const name = cleanText(input?.name, 60)
	const hasName = name !== ''
	if (!hasName) return respondError(400, 'name-required')
	const slugResult = await validateArtistSlug(env, input?.slug || name, '')
	const isError = slugResult instanceof Response
	if (isError) return slugResult
	const id = createId('artist')
	const sql = 'INSERT INTO artists (id, slug, name, email) VALUES (?, ?, ?, ?)'
	await env.DB.prepare(sql).bind(id, slugResult, name, email).run()
	const row = await findArtistByEmail(env, email)
	return respondJson({ artist: toArtist(row as ArtistRowT) })
}

type LinkInputT = { label?: string; url?: string }

const cleanLinks = (links: unknown) => {
	const isList = Array.isArray(links)
	if (!isList) return []
	const entries = (links as LinkInputT[]).slice(0, maxLinks)
	const cleaned = entries.map((link) => ({ label: cleanText(link.label, 40), url: cleanText(link.url, 300) }))
	return cleaned.filter((link) => link.label !== '' && /^https?:\/\//.test(link.url))
}

type UpdateArtistInputT = {
	name?: string
	slug?: string
	bio?: string
	links?: LinkInputT[]
	avatarKey?: string
	headerKey?: string
}

export const handleUpdateArtist = async (request: Request, env: EnvT, artist: ArtistRowT): Promise<Response> => {
	const input = await readJson<UpdateArtistInputT>(request)
	if (!input) return respondError(400, 'invalid-body')
	const name = cleanText(input.name ?? artist.name, 60) || artist.name
	const bio = cleanText(input.bio ?? artist.bio, maxBioLength)
	const hasLinks = input.links !== undefined
	const linksJson = hasLinks ? JSON.stringify(cleanLinks(input.links)) : artist.links_json
	const wantsNewSlug = input.slug !== undefined && input.slug !== artist.slug
	const slugResult = wantsNewSlug ? await validateArtistSlug(env, input.slug, artist.id) : artist.slug
	const isSlugError = slugResult instanceof Response
	if (isSlugError) return slugResult

	const avatarKey = input.avatarKey ?? artist.avatar_key
	const headerKey = input.headerKey ?? artist.header_key
	const keysToCheck = [avatarKey, headerKey].filter((key) => key !== '')
	const ownsAllKeys = keysToCheck.every((key) => checkOwnsKey(artist, key))
	if (!ownsAllKeys) return respondError(403, 'not-yours')

	const sql = 'UPDATE artists SET name = ?, slug = ?, bio = ?, links_json = ?, avatar_key = ?, header_key = ? WHERE id = ?'
	await env.DB.prepare(sql).bind(name, slugResult, bio, linksJson, avatarKey, headerKey, artist.id).run()

	// A replaced picture's old file is no longer needed.
	const oldKeys = [artist.avatar_key, artist.header_key]
	const replacedKeys = oldKeys.filter((key) => key !== avatarKey && key !== headerKey)
	await deleteKeys(env, replacedKeys)

	const updated = await findArtistByEmail(env, artist.email)
	return respondJson({ artist: toArtist(updated as ArtistRowT) })
}

// ---------- everything at once ----------

export const handleStudio = async (env: EnvT, artistRow: ArtistRowT): Promise<Response> => {
	const artist = toArtist(artistRow)
	const trackSql = 'SELECT * FROM tracks WHERE artist_id = ? ORDER BY position, created_at'
	const trackResult = await env.DB.prepare(trackSql).bind(artist.id).all<TrackRowT>()
	const tracks = trackResult.results.map((row) => toTrack(row, artist))
	const playlistSql = 'SELECT * FROM playlists WHERE artist_id = ? ORDER BY created_at DESC'
	const playlistResult = await env.DB.prepare(playlistSql).bind(artist.id).all<PlaylistRowT>()
	const pairSql = `SELECT playlist_tracks.playlist_id, playlist_tracks.track_id FROM playlist_tracks JOIN playlists ON playlists.id = playlist_tracks.playlist_id JOIN tracks ON tracks.id = playlist_tracks.track_id WHERE playlists.artist_id = ? AND ${visiblePlaylistTrack} ORDER BY playlist_tracks.position`
	const pairResult = await env.DB.prepare(pairSql).bind(artist.id).all<{ playlist_id: string; track_id: string }>()

	const getTrackIds = (playlistId: string) => {
		const pairs = pairResult.results.filter((pair) => pair.playlist_id === playlistId)
		return pairs.map((pair) => pair.track_id)
	}

	const playlists = playlistResult.results.map((row) => toPlaylist(row, artist, getTrackIds(row.id)))
	const savedTracks = await listSavedTracks(env, artist.id)
	const guestTracks = await listPlaylistGuestTracks(env, artist.id)
	return respondJson({ artist, tracks, playlists, savedTracks, guestTracks })
}

// ---------- tracks ----------

type CreateTrackInputT = { title?: string; audioKey?: string; duration?: number }

// New tracks land at the top of the list.
export const handleCreateTrack = async (request: Request, env: EnvT, artist: ArtistRowT): Promise<Response> => {
	const input = await readJson<CreateTrackInputT>(request)
	const audioKey = input?.audioKey ?? ''
	const isOwned = checkOwnsKey(artist, audioKey)
	if (!isOwned) return respondError(403, 'not-yours')
	const audioObject = await env.MEDIA.head(audioKey)
	if (!audioObject) return respondError(400, 'upload-missing')

	const title = cleanText(input?.title, maxTitleLength) || 'Untitled'
	const slug = await findFreeSlug(env, 'tracks', artist.id, title)
	const duration = Math.max(0, Number(input?.duration) || 0)
	const topRow = await env.DB.prepare('SELECT MIN(position) AS top FROM tracks WHERE artist_id = ?').bind(artist.id).first<{ top: number | null }>()
	const position = (topRow?.top ?? 1) - 1
	const id = createId('track')
	const sql = 'INSERT INTO tracks (id, artist_id, slug, title, audio_key, duration_seconds, position) VALUES (?, ?, ?, ?, ?, ?, ?)'
	await env.DB.prepare(sql).bind(id, artist.id, slug, title, audioKey, duration, position).run()
	const row = await findTrackRow(env, artist, id)
	return respondJson({ track: toTrack(row as TrackRowT, toArtist(artist)) })
}

type UpdateTrackInputT = {
	title?: string
	genre?: string
	description?: string
	visibility?: string
	artworkKey?: string
	audioKey?: string
	duration?: number
}

export const handleUpdateTrack = async (request: Request, env: EnvT, artist: ArtistRowT, trackId: string): Promise<Response> => {
	const row = await findTrackRow(env, artist, trackId)
	if (!row) return respondMissing()
	const input = await readJson<UpdateTrackInputT>(request)
	if (!input) return respondError(400, 'invalid-body')

	const title = cleanText(input.title ?? row.title, maxTitleLength) || row.title
	const genre = cleanText(input.genre ?? row.genre, 40)
	const description = cleanText(input.description ?? row.description, maxDescriptionLength)
	const visibility = checkIsVisibility(input.visibility) ? input.visibility : row.visibility
	const artworkKey = input.artworkKey ?? row.artwork_key
	const audioKey = input.audioKey ?? row.audio_key
	const duration = input.duration ?? row.duration_seconds
	const keysToCheck = [artworkKey, audioKey].filter((key) => key !== '')
	const ownsAllKeys = keysToCheck.every((key) => checkOwnsKey(artist, key))
	if (!ownsAllKeys) return respondError(403, 'not-yours')

	const isRenamed = title !== row.title
	const slug = isRenamed ? await findFreeSlug(env, 'tracks', artist.id, title, row.id) : row.slug
	const isSlugChanged = slug !== row.slug
	if (isSlugChanged) await recordOldSlug(env, artist.id, 'track', row.slug, row.id)

	const sql = 'UPDATE tracks SET title = ?, slug = ?, genre = ?, description = ?, visibility = ?, artwork_key = ?, audio_key = ?, duration_seconds = ? WHERE id = ?'
	await env.DB.prepare(sql).bind(title, slug, genre, description, visibility, artworkKey, audioKey, duration, row.id).run()

	const oldKeys = [row.artwork_key, row.audio_key]
	const replacedKeys = oldKeys.filter((key) => key !== artworkKey && key !== audioKey)
	await deleteKeys(env, replacedKeys)

	const updated = await findTrackRow(env, artist, row.id)
	return respondJson({ track: toTrack(updated as TrackRowT, toArtist(artist)) })
}

export const handleDeleteTrack = async (env: EnvT, artist: ArtistRowT, trackId: string): Promise<Response> => {
	const row = await findTrackRow(env, artist, trackId)
	if (!row) return respondMissing()
	await env.DB.batch([
		env.DB.prepare('DELETE FROM playlist_tracks WHERE track_id = ?').bind(row.id),
		env.DB.prepare('DELETE FROM saves WHERE track_id = ?').bind(row.id),
		env.DB.prepare('DELETE FROM play_counts WHERE track_id = ?').bind(row.id),
		env.DB.prepare("DELETE FROM slug_history WHERE item_id = ? AND kind = 'track'").bind(row.id),
		env.DB.prepare('DELETE FROM tracks WHERE id = ?').bind(row.id)
	])
	await deleteKeys(env, [row.audio_key, row.artwork_key])
	return respondJson({ deleted: row.id })
}

type OrderInputT = { ids?: string[] }

// Saves the order the artist dragged the list into.
export const handleReorderTracks = async (request: Request, env: EnvT, artist: ArtistRowT): Promise<Response> => {
	const input = await readJson<OrderInputT>(request)
	const ids = input?.ids ?? []
	const sql = 'UPDATE tracks SET position = ? WHERE id = ? AND artist_id = ?'
	const statements = ids.map((id, index) => env.DB.prepare(sql).bind(index, id, artist.id))
	const hasStatements = statements.length > 0
	if (hasStatements) await env.DB.batch(statements)
	return respondJson({ ok: true })
}

// ---------- playlists ----------

type PlaylistInputT = {
	name?: string
	description?: string
	visibility?: string
	coverKey?: string
}

export const handleCreatePlaylist = async (request: Request, env: EnvT, artist: ArtistRowT): Promise<Response> => {
	const input = await readJson<PlaylistInputT>(request)
	const name = cleanText(input?.name, maxTitleLength) || 'Untitled playlist'
	const description = cleanText(input?.description, maxDescriptionLength)
	const visibility = checkIsVisibility(input?.visibility) ? input?.visibility : 'public'
	const coverKey = input?.coverKey ?? ''
	const hasCover = coverKey !== ''
	const isCoverOwned = !hasCover || checkOwnsKey(artist, coverKey)
	if (!isCoverOwned) return respondError(403, 'not-yours')
	const slug = await findFreeSlug(env, 'playlists', artist.id, name)
	const id = createId('playlist')
	const sql = 'INSERT INTO playlists (id, artist_id, slug, name, description, visibility, cover_key) VALUES (?, ?, ?, ?, ?, ?, ?)'
	await env.DB.prepare(sql).bind(id, artist.id, slug, name, description, visibility, coverKey).run()
	const row = await findPlaylistRow(env, artist, id)
	return respondJson({ playlist: toPlaylist(row as PlaylistRowT, toArtist(artist), []) })
}

export const handleUpdatePlaylist = async (request: Request, env: EnvT, artist: ArtistRowT, playlistId: string): Promise<Response> => {
	const row = await findPlaylistRow(env, artist, playlistId)
	if (!row) return respondMissing()
	const input = await readJson<PlaylistInputT>(request)
	if (!input) return respondError(400, 'invalid-body')
	const name = cleanText(input.name ?? row.name, maxTitleLength) || row.name
	const description = cleanText(input.description ?? row.description, maxDescriptionLength)
	const visibility = checkIsVisibility(input.visibility) ? input.visibility : row.visibility
	const coverKey = input.coverKey ?? row.cover_key
	const hasCover = coverKey !== ''
	const isCoverOwned = !hasCover || checkOwnsKey(artist, coverKey)
	if (!isCoverOwned) return respondError(403, 'not-yours')

	const isRenamed = name !== row.name
	const slug = isRenamed ? await findFreeSlug(env, 'playlists', artist.id, name, row.id) : row.slug
	const isSlugChanged = slug !== row.slug
	if (isSlugChanged) await recordOldSlug(env, artist.id, 'playlist', row.slug, row.id)

	const sql = 'UPDATE playlists SET name = ?, slug = ?, description = ?, visibility = ?, cover_key = ? WHERE id = ?'
	await env.DB.prepare(sql).bind(name, slug, description, visibility, coverKey, row.id).run()
	const isCoverReplaced = row.cover_key !== coverKey
	if (isCoverReplaced) await deleteKeys(env, [row.cover_key])
	return respondJson({ ok: true })
}

export const handleDeletePlaylist = async (env: EnvT, artist: ArtistRowT, playlistId: string): Promise<Response> => {
	const row = await findPlaylistRow(env, artist, playlistId)
	if (!row) return respondMissing()
	await env.DB.batch([
		env.DB.prepare('DELETE FROM playlist_tracks WHERE playlist_id = ?').bind(row.id),
		env.DB.prepare("DELETE FROM slug_history WHERE item_id = ? AND kind = 'playlist'").bind(row.id),
		env.DB.prepare('DELETE FROM playlists WHERE id = ?').bind(row.id)
	])
	await deleteKeys(env, [row.cover_key])
	return respondJson({ deleted: row.id })
}

// Replaces the playlist's tracks with this list, in
// this order. Keeps the artist's own tracks and other
// artists' public ones.
export const handleSetPlaylistTracks = async (request: Request, env: EnvT, artist: ArtistRowT, playlistId: string): Promise<Response> => {
	const row = await findPlaylistRow(env, artist, playlistId)
	if (!row) return respondMissing()
	const input = await readJson<OrderInputT>(request)
	const requestedIds = input?.ids ?? []
	const uniqueIds = [...new Set(requestedIds)]
	const allowedSql = "SELECT id FROM tracks WHERE id IN (SELECT value FROM json_each(?)) AND (artist_id = ? OR visibility = 'public')"
	const allowedResult = await env.DB.prepare(allowedSql).bind(JSON.stringify(uniqueIds), artist.id).all<{ id: string }>()
	const allowedIds = new Set(allowedResult.results.map((track) => track.id))
	const keptIds = uniqueIds.filter((id) => allowedIds.has(id))
	const insertSql = 'INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES (?, ?, ?)'
	const inserts = keptIds.map((trackId, index) => env.DB.prepare(insertSql).bind(row.id, trackId, index))
	const clear = env.DB.prepare('DELETE FROM playlist_tracks WHERE playlist_id = ?').bind(row.id)
	await env.DB.batch([clear, ...inserts])
	return respondJson({ trackIds: keptIds })
}
