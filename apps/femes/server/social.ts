import type { EnvT } from './env'
import { readJson, respondError, respondJson, respondMissing } from './respond'
import { joinedTrackColumns, toArtist, toJoinedTrack } from './rows'
import type { ArtistRowT, JoinedTrackRowT } from './rows'

// Plays, saves, and follows. Each is something an artist
// does. None of them becomes a number on a public page.

const freshTracksLimit = 40

// ---------- plays ----------

const getToday = (): string => new Date().toISOString().slice(0, 10)

type PlayInputT = { trackId?: string }

// Counted per track per day, with nothing about who
// listened. Private tracks are never counted.
export const handleRecordPlay = async (request: Request, env: EnvT): Promise<Response> => {
	const input = await readJson<PlayInputT>(request)
	const trackId = input?.trackId ?? ''
	const trackSql = "SELECT id FROM tracks WHERE id = ? AND visibility != 'private'"
	const track = await env.DB.prepare(trackSql).bind(trackId).first<{ id: string }>()
	if (!track) return respondMissing()
	const countSql = 'INSERT INTO play_counts (track_id, day, plays) VALUES (?, ?, 1) ON CONFLICT (track_id, day) DO UPDATE SET plays = plays + 1'
	await env.DB.prepare(countSql).bind(track.id, getToday()).run()
	return new Response(null, { status: 204 })
}

// ---------- what the signed-in artist has ----------

export const listSavedTrackIds = async (env: EnvT, artistId: string): Promise<string[]> => {
	const result = await env.DB.prepare('SELECT track_id FROM saves WHERE artist_id = ?').bind(artistId).all<{ track_id: string }>()
	return result.results.map((row) => row.track_id)
}

export const listFollowingIds = async (env: EnvT, artistId: string): Promise<string[]> => {
	const result = await env.DB.prepare('SELECT followed_id FROM follows WHERE follower_id = ?').bind(artistId).all<{ followed_id: string }>()
	return result.results.map((row) => row.followed_id)
}

// Saved songs, newest first. A song its artist made
// private or deleted drops out.
export const listSavedTracks = async (env: EnvT, artistId: string) => {
	const sql = `SELECT ${joinedTrackColumns} FROM saves JOIN tracks ON tracks.id = saves.track_id JOIN artists ON artists.id = tracks.artist_id WHERE saves.artist_id = ? AND tracks.visibility = 'public' ORDER BY saves.created_at DESC`
	const result = await env.DB.prepare(sql).bind(artistId).all<JoinedTrackRowT>()
	return result.results.map(toJoinedTrack)
}

// Other artists' songs already in this artist's
// playlists, so they still show after being unsaved.
export const listPlaylistGuestTracks = async (env: EnvT, artistId: string) => {
	const sql = `SELECT DISTINCT ${joinedTrackColumns} FROM playlist_tracks JOIN playlists ON playlists.id = playlist_tracks.playlist_id JOIN tracks ON tracks.id = playlist_tracks.track_id JOIN artists ON artists.id = tracks.artist_id WHERE playlists.artist_id = ? AND tracks.artist_id != ? AND tracks.visibility = 'public'`
	const result = await env.DB.prepare(sql).bind(artistId, artistId).all<JoinedTrackRowT>()
	return result.results.map(toJoinedTrack)
}

// ---------- saves ----------

// Only other artists' public songs can be saved.
export const handleSave = async (env: EnvT, artist: ArtistRowT, trackId: string): Promise<Response> => {
	const sql = "SELECT id FROM tracks WHERE id = ? AND artist_id != ? AND visibility = 'public'"
	const track = await env.DB.prepare(sql).bind(trackId, artist.id).first<{ id: string }>()
	if (!track) return respondError(404, 'not-saveable')
	await env.DB.prepare('INSERT OR IGNORE INTO saves (artist_id, track_id) VALUES (?, ?)').bind(artist.id, track.id).run()
	return respondJson({ saved: true })
}

export const handleUnsave = async (env: EnvT, artist: ArtistRowT, trackId: string): Promise<Response> => {
	await env.DB.prepare('DELETE FROM saves WHERE artist_id = ? AND track_id = ?').bind(artist.id, trackId).run()
	return respondJson({ saved: false })
}

// ---------- follows ----------

export const handleFollow = async (env: EnvT, artist: ArtistRowT, followedId: string): Promise<Response> => {
	const isSelf = followedId === artist.id
	if (isSelf) return respondError(400, 'self-follow')
	const followed = await env.DB.prepare('SELECT id FROM artists WHERE id = ?').bind(followedId).first<{ id: string }>()
	if (!followed) return respondMissing()
	await env.DB.prepare('INSERT OR IGNORE INTO follows (follower_id, followed_id) VALUES (?, ?)').bind(artist.id, followed.id).run()
	return respondJson({ following: true })
}

export const handleUnfollow = async (env: EnvT, artist: ArtistRowT, followedId: string): Promise<Response> => {
	await env.DB.prepare('DELETE FROM follows WHERE follower_id = ? AND followed_id = ?').bind(artist.id, followedId).run()
	return respondJson({ following: false })
}

// ---------- library ----------

const listFollowing = async (env: EnvT, artistId: string) => {
	const sql = 'SELECT artists.* FROM follows JOIN artists ON artists.id = follows.followed_id WHERE follows.follower_id = ? ORDER BY follows.created_at DESC'
	const result = await env.DB.prepare(sql).bind(artistId).all<ArtistRowT>()
	return result.results.map(toArtist)
}

// The newest public songs from everyone followed.
const listFreshTracks = async (env: EnvT, artistId: string) => {
	const sql = `SELECT ${joinedTrackColumns} FROM follows JOIN tracks ON tracks.artist_id = follows.followed_id JOIN artists ON artists.id = tracks.artist_id WHERE follows.follower_id = ? AND tracks.visibility = 'public' ORDER BY tracks.created_at DESC LIMIT ?`
	const result = await env.DB.prepare(sql).bind(artistId, freshTracksLimit).all<JoinedTrackRowT>()
	return result.results.map(toJoinedTrack)
}

export const handleLibrary = async (env: EnvT, artist: ArtistRowT): Promise<Response> => {
	const following = await listFollowing(env, artist.id)
	const freshTracks = await listFreshTracks(env, artist.id)
	return respondJson({ following, freshTracks })
}
