import type { ArtistPageT, ArtistT, PlaylistPageT, TrackPageT } from '../src/data/types'
import { buildPlaylistPath, buildTrackPath } from '../src/routing/routes'
import type { EnvT } from './env'
import { respondJson, respondMissing, respondMoved } from './respond'
import { toArtist, toPlaylist, toTrack } from './rows'
import type { ArtistRowT, PlaylistRowT, TrackRowT } from './rows'

// Read-only answers for the public pages. Private items
// never leave the database. Unlisted ones open by link
// but never appear in lists.

const moreTracksCount = 3

const findArtist = async (env: EnvT, artistSlug: string): Promise<ArtistT | undefined> => {
	const statement = env.DB.prepare('SELECT * FROM artists WHERE slug = ?').bind(artistSlug)
	const row = await statement.first<ArtistRowT>()
	if (!row) return undefined
	return toArtist(row)
}

const listPublicTracks = async (env: EnvT, artist: ArtistT) => {
	const sql = "SELECT * FROM tracks WHERE artist_id = ? AND visibility = 'public' ORDER BY position, created_at"
	const result = await env.DB.prepare(sql).bind(artist.id).all<TrackRowT>()
	return result.results.map((row) => toTrack(row, artist))
}

// A slug that moved on rename points to the item's
// current slug, so old links keep working.
const findMovedSlug = async (env: EnvT, artist: ArtistT, kind: 'track' | 'playlist', oldSlug: string) => {
	const table = kind === 'track' ? 'tracks' : 'playlists'
	const sql = `SELECT ${table}.slug AS slug FROM slug_history JOIN ${table} ON ${table}.id = slug_history.item_id WHERE slug_history.artist_id = ? AND slug_history.kind = ? AND slug_history.old_slug = ?`
	const row = await env.DB.prepare(sql).bind(artist.id, kind, oldSlug).first<{ slug: string }>()
	return row?.slug
}

// Every lookup answers with the page, a new address for
// a renamed item, or nothing.
export type LookupT<T> = { kind: 'found'; page: T } | { kind: 'moved'; path: string } | { kind: 'missing' }

const missing = { kind: 'missing' } as const

export const loadArtistPage = async (env: EnvT, artistSlug: string): Promise<LookupT<ArtistPageT>> => {
	const artist = await findArtist(env, artistSlug)
	if (!artist) return missing
	const tracks = await listPublicTracks(env, artist)
	const playlistSql = "SELECT * FROM playlists WHERE artist_id = ? AND visibility = 'public' ORDER BY created_at DESC"
	const playlistResult = await env.DB.prepare(playlistSql).bind(artist.id).all<PlaylistRowT>()
	const pairSql = 'SELECT playlist_id, track_id FROM playlist_tracks WHERE playlist_id IN (SELECT id FROM playlists WHERE artist_id = ?) ORDER BY position'
	const pairResult = await env.DB.prepare(pairSql).bind(artist.id).all<{ playlist_id: string; track_id: string }>()

	const getTrackIds = (playlistId: string) => {
		const pairs = pairResult.results.filter((pair) => pair.playlist_id === playlistId)
		return pairs.map((pair) => pair.track_id)
	}

	const playlists = playlistResult.results.map((row) => toPlaylist(row, artist, getTrackIds(row.id)))
	return { kind: 'found', page: { artist, tracks, playlists } }
}

export const loadTrackPage = async (env: EnvT, artistSlug: string, trackSlug: string): Promise<LookupT<TrackPageT>> => {
	const artist = await findArtist(env, artistSlug)
	if (!artist) return missing
	const sql = "SELECT * FROM tracks WHERE artist_id = ? AND slug = ? AND visibility != 'private'"
	const row = await env.DB.prepare(sql).bind(artist.id, trackSlug).first<TrackRowT>()

	if (!row) {
		const currentSlug = await findMovedSlug(env, artist, 'track', trackSlug)
		if (!currentSlug) return missing
		return { kind: 'moved', path: buildTrackPath(artist.slug, currentSlug) }
	}

	const track = toTrack(row, artist)
	const publicTracks = await listPublicTracks(env, artist)
	const otherTracks = publicTracks.filter((entry) => entry.id !== track.id)
	const moreTracks = otherTracks.slice(0, moreTracksCount)
	return { kind: 'found', page: { artist, track, moreTracks } }
}

export const loadPlaylistPage = async (env: EnvT, artistSlug: string, playlistSlug: string): Promise<LookupT<PlaylistPageT>> => {
	const artist = await findArtist(env, artistSlug)
	if (!artist) return missing
	const sql = "SELECT * FROM playlists WHERE artist_id = ? AND slug = ? AND visibility != 'private'"
	const row = await env.DB.prepare(sql).bind(artist.id, playlistSlug).first<PlaylistRowT>()

	if (!row) {
		const currentSlug = await findMovedSlug(env, artist, 'playlist', playlistSlug)
		if (!currentSlug) return missing
		return { kind: 'moved', path: buildPlaylistPath(artist.slug, currentSlug) }
	}

	const trackSql = "SELECT tracks.* FROM playlist_tracks JOIN tracks ON tracks.id = playlist_tracks.track_id WHERE playlist_tracks.playlist_id = ? AND tracks.visibility != 'private' ORDER BY playlist_tracks.position"
	const trackResult = await env.DB.prepare(trackSql).bind(row.id).all<TrackRowT>()
	const tracks = trackResult.results.map((trackRow) => toTrack(trackRow, artist))
	const trackIds = tracks.map((track) => track.id)
	const playlist = toPlaylist(row, artist, trackIds)
	return { kind: 'found', page: { artist, playlist, tracks } }
}

const respondLookup = <T>(lookup: LookupT<T>): Response => {
	const isMoved = lookup.kind === 'moved'
	if (isMoved) return respondMoved(lookup.path)
	const isMissing = lookup.kind === 'missing'
	if (isMissing) return respondMissing()
	return respondJson(lookup.page)
}

export const handleArtistPage = async (env: EnvT, artistSlug: string) => respondLookup(await loadArtistPage(env, artistSlug))

export const handleTrackPage = async (env: EnvT, artistSlug: string, trackSlug: string) => {
	return respondLookup(await loadTrackPage(env, artistSlug, trackSlug))
}

export const handlePlaylistPage = async (env: EnvT, artistSlug: string, playlistSlug: string) => {
	return respondLookup(await loadPlaylistPage(env, artistSlug, playlistSlug))
}
