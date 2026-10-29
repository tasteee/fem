import { showToast } from '@tasteee/fem'
import * as api from './studio-api'
import { refreshStudio } from './studio.svelte'

// Who is looking at a public page. Listeners are never
// signed in and see nothing extra. A signed-in artist
// gets Save on songs and Follow on artists.

type ViewerStateT = {
	artistId: string
	artistSlug: string
	savedTrackIds: string[]
	followingIds: string[]
}

export const viewer = $state<ViewerStateT>({
	artistId: '',
	artistSlug: '',
	savedTrackIds: [],
	followingIds: []
})

const isDemo = import.meta.env.VITE_CATALOG === 'demo'
let hasLoaded = false

const loadViewer = async () => {
	try {
		const me = await api.getMe()
		const artist = me?.artist
		if (!artist) return
		viewer.artistId = artist.id
		viewer.artistSlug = artist.slug
		viewer.savedTrackIds = me?.savedTrackIds ?? []
		viewer.followingIds = me?.followingIds ?? []
	} catch (viewerError) {
		// Pages work the same without it, so this only logs.
		console.warn('femes: could not read the signed-in artist', viewerError)
	}
}

// Loads once per visit.
export const ensureViewer = () => {
	if (hasLoaded) return
	hasLoaded = true
	if (isDemo) return
	loadViewer()
}

export const checkIsSignedInArtist = (): boolean => viewer.artistId !== ''

// An artist can't save their own songs or follow
// themselves.
export const checkIsOwnSlug = (artistSlug: string): boolean => viewer.artistSlug === artistSlug

// ---------- saves ----------

export const checkIsSaved = (trackId: string): boolean => viewer.savedTrackIds.includes(trackId)

const setSaved = (trackId: string, shouldSave: boolean) => {
	const withoutTrack = viewer.savedTrackIds.filter((id) => id !== trackId)
	viewer.savedTrackIds = shouldSave ? [...withoutTrack, trackId] : withoutTrack
}

// Flips right away and flips back if the server says no.
export const toggleSave = async (trackId: string) => {
	const wasSaved = checkIsSaved(trackId)
	setSaved(trackId, !wasSaved)

	try {
		const request = wasSaved ? api.unsaveTrack(trackId) : api.saveTrack(trackId)
		await request
		await refreshStudio()
	} catch (saveError) {
		console.error('femes: save failed', saveError)
		setSaved(trackId, wasSaved)
		showToast("Couldn't save that. Try again.")
	}
}

// ---------- follows ----------

export const checkIsFollowing = (artistId: string): boolean => viewer.followingIds.includes(artistId)

const setFollowing = (artistId: string, shouldFollow: boolean) => {
	const withoutArtist = viewer.followingIds.filter((id) => id !== artistId)
	viewer.followingIds = shouldFollow ? [...withoutArtist, artistId] : withoutArtist
}

export const toggleFollow = async (artistId: string) => {
	const wasFollowing = checkIsFollowing(artistId)
	setFollowing(artistId, !wasFollowing)

	try {
		const request = wasFollowing ? api.unfollowArtist(artistId) : api.followArtist(artistId)
		await request
	} catch (followError) {
		console.error('femes: follow failed', followError)
		setFollowing(artistId, wasFollowing)
		showToast("Couldn't follow just now. Try again.")
	}
}
