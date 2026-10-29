import { showToast } from '@tasteee/fem'
import * as api from './studio-api'
import { refreshStudio, studio } from './studio.svelte'

// Save and Follow for a signed-in artist. Listeners are
// never signed in and see neither.

export { checkIsOwnSlug, checkIsSignedInArtist } from './studio.svelte'

// ---------- saves ----------

export const checkIsSaved = (trackId: string): boolean => studio.savedTrackIds.includes(trackId)

const setSaved = (trackId: string, shouldSave: boolean) => {
	const withoutTrack = studio.savedTrackIds.filter((id) => id !== trackId)
	studio.savedTrackIds = shouldSave ? [...withoutTrack, trackId] : withoutTrack
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

export const checkIsFollowing = (artistId: string): boolean => studio.followingIds.includes(artistId)

const setFollowing = (artistId: string, shouldFollow: boolean) => {
	const withoutArtist = studio.followingIds.filter((id) => id !== artistId)
	studio.followingIds = shouldFollow ? [...withoutArtist, artistId] : withoutArtist
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
