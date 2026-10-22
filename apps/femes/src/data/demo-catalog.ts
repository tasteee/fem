import type { ArtistT, FemesTrackT, PlaylistT } from './types'

// Stand-in data until the backend is in. The pages read
// it through catalog.ts, so swapping it out touches
// nothing else.

const buildArtworkUrl = (seed: string): string => `https://picsum.photos/seed/femes-${seed}/800/800`

export const demoArtists: ArtistT[] = [
	{
		id: 'artist-tasteink',
		slug: 'tasteink',
		name: 'tasteink',
		bio: "Dark pop from Texas. Songs about the things we don't say out loud.",
		avatarUrl: buildArtworkUrl('avatar'),
		headerUrl: 'https://picsum.photos/seed/femes-header/1600/400',
		links: [
			{ label: 'Instagram', url: 'https://instagram.com/' },
			{ label: 'TikTok', url: 'https://tiktok.com/' }
		]
	}
]

export const demoTracks: FemesTrackT[] = [
	{
		id: 'track-safeword',
		slug: 'safeword',
		artistSlug: 'tasteink',
		src: '/demo/safeword.mp3',
		title: 'safeword',
		artist: 'tasteink',
		artwork: buildArtworkUrl('safeword'),
		duration: 24,
		href: '/tasteink/track/safeword',
		genre: 'Dark pop',
		description: 'Written at 3am in a hotel room. Dark pop in D minor.',
		visibility: 'public'
	},
	{
		id: 'track-glass-hours',
		slug: 'glass-hours',
		artistSlug: 'tasteink',
		src: '/demo/glass-hours.mp3',
		title: 'glass hours',
		artist: 'tasteink',
		artwork: buildArtworkUrl('glass'),
		duration: 28,
		href: '/tasteink/track/glass-hours',
		genre: 'Ambient',
		description: '',
		visibility: 'public'
	},
	{
		id: 'track-low-tide',
		slug: 'low-tide',
		artistSlug: 'tasteink',
		src: '/demo/low-tide.mp3',
		title: 'low tide',
		artist: 'tasteink',
		artwork: '',
		duration: 20,
		href: '/tasteink/track/low-tide',
		genre: 'Indie',
		description: '',
		visibility: 'public'
	}
]

export const demoPlaylists: PlaylistT[] = [
	{
		id: 'playlist-late-night-drafts',
		slug: 'late-night-drafts',
		artistSlug: 'tasteink',
		name: 'late night drafts',
		description: 'Unfinished ideas I keep coming back to. Headphones on.',
		coverUrl: buildArtworkUrl('drafts'),
		visibility: 'public',
		trackIds: ['track-low-tide', 'track-safeword']
	}
]
