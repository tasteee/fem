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

// A track as femes stores it. Its first fields are the
// player's TrackT, so it plays as is. Spelled out here so
// the server needs no browser code to read it.
export type FemesTrackT = {
	id: string
	src: string
	title: string
	artist: string
	artwork?: string
	duration?: number
	href?: string
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
