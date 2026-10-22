import type { TrackT } from '@tasteee/fem-media'

export type VisibilityT = 'public' | 'unlisted' | 'private'

export type SocialLinkT = {
	label: string
	url: string
}

export type ArtistT = {
	id: string
	slug: string
	name: string
	bio: string
	avatarUrl: string
	headerUrl: string
	links: SocialLinkT[]
}

// A track as femes stores it. It carries everything the
// player needs, plus what the pages show.
export type FemesTrackT = TrackT & {
	slug: string
	artistSlug: string
	genre: string
	description: string
	visibility: VisibilityT
}

export type PlaylistT = {
	id: string
	slug: string
	artistSlug: string
	name: string
	description: string
	coverUrl: string
	visibility: VisibilityT
	trackIds: string[]
}

export type ArtistPageT = {
	artist: ArtistT
	tracks: FemesTrackT[]
	playlists: PlaylistT[]
}

export type TrackPageT = {
	artist: ArtistT
	track: FemesTrackT
	moreTracks: FemesTrackT[]
}

export type PlaylistPageT = {
	artist: ArtistT
	playlist: PlaylistT
	tracks: FemesTrackT[]
}
