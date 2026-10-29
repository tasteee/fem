import type { ArtistT, FemesTrackT, PlaylistT, SocialLinkT, VisibilityT } from '../src/data/types'
import { buildTrackPath } from '../src/routing/routes'

// Database rows, as D1 returns them, and how each one
// becomes what the pages read.

export type ArtistRowT = {
	id: string
	slug: string
	name: string
	bio: string
	email: string
	avatar_key: string
	header_key: string
	links_json: string
}

export type TrackRowT = {
	id: string
	artist_id: string
	slug: string
	title: string
	genre: string
	description: string
	visibility: VisibilityT
	audio_key: string
	artwork_key: string
	duration_seconds: number
}

export type PlaylistRowT = {
	id: string
	artist_id: string
	slug: string
	name: string
	description: string
	cover_key: string
	visibility: VisibilityT
}

// Files stream from the same site, so they share its
// address and need no CORS.
export const buildMediaUrl = (key: string): string => {
	const hasKey = key !== ''
	if (!hasKey) return ''
	return `/media/${key}`
}

const parseLinks = (linksJson: string): SocialLinkT[] => {
	try {
		const parsed = JSON.parse(linksJson)
		const isList = Array.isArray(parsed)
		if (!isList) return []
		return parsed as SocialLinkT[]
	} catch (parseError) {
		console.warn('femes: bad links_json', parseError)
		return []
	}
}

export const toArtist = (row: ArtistRowT): ArtistT => {
	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		bio: row.bio,
		avatarUrl: buildMediaUrl(row.avatar_key),
		headerUrl: buildMediaUrl(row.header_key),
		links: parseLinks(row.links_json)
	}
}

// What a track needs to know about its artist.
type TrackArtistT = Pick<ArtistT, 'slug' | 'name'>

export const toTrack = (row: TrackRowT, artist: TrackArtistT): FemesTrackT => {
	return {
		id: row.id,
		slug: row.slug,
		artistSlug: artist.slug,
		src: buildMediaUrl(row.audio_key),
		title: row.title,
		artist: artist.name,
		artwork: buildMediaUrl(row.artwork_key),
		duration: row.duration_seconds,
		href: buildTrackPath(artist.slug, row.slug),
		genre: row.genre,
		description: row.description,
		visibility: row.visibility
	}
}

export const toPlaylist = (row: PlaylistRowT, artist: ArtistT, trackIds: string[]): PlaylistT => {
	return {
		id: row.id,
		slug: row.slug,
		artistSlug: artist.slug,
		name: row.name,
		description: row.description,
		coverUrl: buildMediaUrl(row.cover_key),
		visibility: row.visibility,
		trackIds
	}
}

// A track read together with its own artist, for lists
// that mix artists: playlists, saves, and the feed.
export type JoinedTrackRowT = TrackRowT & {
	artist_slug: string
	artist_name: string
}

export const joinedTrackColumns = 'tracks.*, artists.slug AS artist_slug, artists.name AS artist_name'

export const toJoinedTrack = (row: JoinedTrackRowT): FemesTrackT => {
	const artist = { slug: row.artist_slug, name: row.artist_name }
	return toTrack(row, artist)
}
