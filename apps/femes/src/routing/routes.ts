// Public addresses:
//   /artist
//   /artist/track/track-name
//   /artist/playlist/playlist-name

export type RouteT =
	| { kind: 'home' }
	| { kind: 'artist'; artistSlug: string }
	| { kind: 'track'; artistSlug: string; trackSlug: string }
	| { kind: 'playlist'; artistSlug: string; playlistSlug: string }
	| { kind: 'signin' }
	| { kind: 'studio' }
	| { kind: 'following' }
	| { kind: 'saved' }
	| { kind: 'embed-track'; artistSlug: string; trackSlug: string }
	| { kind: 'not-found' }

// Paths the app owns. No artist can take these names.
export const reservedSlugs = ['studio', 'signin', 'embed', 'api', 'demo', 'assets', 'track', 'playlist', 'following', 'saved', 'messages', 'me']

export const buildArtistPath = (artistSlug: string): string => `/${artistSlug}`

export const buildTrackPath = (artistSlug: string, trackSlug: string): string => `/${artistSlug}/track/${trackSlug}`

export const buildPlaylistPath = (artistSlug: string, playlistSlug: string): string => {
	return `/${artistSlug}/playlist/${playlistSlug}`
}

const getSegments = (pathname: string): string[] => {
	const parts = pathname.split('/').filter((part) => part !== '')
	return parts.map((part) => decodeURIComponent(part).toLowerCase())
}

// /studio is where sign-in lands. It sends an artist to
// their own page, which is where they manage everything.
export const studioPath = '/studio'
export const followingPath = '/following'
export const savedPath = '/saved'

export const buildEmbedTrackPath = (artistSlug: string, trackSlug: string): string => `/embed/${artistSlug}/track/${trackSlug}`

// /embed/:artist/track/:track
const parseEmbedRoute = (segments: string[]): RouteT => {
	const isTrackEmbed = segments.length === 4 && segments[2] === 'track'
	if (isTrackEmbed) return { kind: 'embed-track', artistSlug: segments[1], trackSlug: segments[3] }
	return { kind: 'not-found' }
}

export const parseRoute = (pathname: string): RouteT => {
	const segments = getSegments(pathname)
	const isHome = segments.length === 0
	if (isHome) return { kind: 'home' }
	const isSignIn = segments[0] === 'signin'
	if (isSignIn) return { kind: 'signin' }
	const isStudio = segments[0] === 'studio' || segments[0] === 'me'
	if (isStudio) return { kind: 'studio' }
	const isFollowing = segments[0] === 'following' && segments.length === 1
	if (isFollowing) return { kind: 'following' }
	const isSaved = segments[0] === 'saved' && segments.length === 1
	if (isSaved) return { kind: 'saved' }
	const isEmbed = segments[0] === 'embed'
	if (isEmbed) return parseEmbedRoute(segments)

	const artistSlug = segments[0]
	const isReserved = reservedSlugs.includes(artistSlug)
	if (isReserved) return { kind: 'not-found' }

	const isArtist = segments.length === 1
	if (isArtist) return { kind: 'artist', artistSlug }

	const isPair = segments.length === 3
	if (!isPair) return { kind: 'not-found' }

	const section = segments[1]
	const itemSlug = segments[2]
	const isTrack = section === 'track'
	if (isTrack) return { kind: 'track', artistSlug, trackSlug: itemSlug }
	const isPlaylist = section === 'playlist'
	if (isPlaylist) return { kind: 'playlist', artistSlug, playlistSlug: itemSlug }
	return { kind: 'not-found' }
}

// Turns a name into its address part: "late night
// drafts" becomes "late-night-drafts".
export const buildSlug = (name: string): string => {
	const lowered = name.toLowerCase().normalize('NFKD')
	const withoutMarks = lowered.replace(/[̀-ͯ]/g, '')
	const dashed = withoutMarks.replace(/[^a-z0-9]+/g, '-')
	return dashed.replace(/^-+|-+$/g, '')
}
