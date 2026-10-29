import * as api from './studio-api'
import type { ArtistT, FemesTrackT, PlaylistT } from './types'

// The Studio's shared state. Pages read it; actions
// call the API, then update it with what came back.

export type StudioStatusT = 'loading' | 'signed-out' | 'no-artist' | 'ready' | 'failed'

type StudioStateT = {
	status: StudioStatusT
	email: string
	artist: ArtistT | null
	tracks: FemesTrackT[]
	playlists: PlaylistT[]
	savedTracks: FemesTrackT[]
	guestTracks: FemesTrackT[]
}

export const studio = $state<StudioStateT>({
	status: 'loading',
	email: '',
	artist: null,
	tracks: [],
	playlists: [],
	savedTracks: [],
	guestTracks: []
})

let hasLoaded = false

const applyData = (data: api.StudioDataT) => {
	studio.artist = data.artist
	studio.tracks = data.tracks
	studio.playlists = data.playlists
	studio.savedTracks = data.savedTracks
	studio.guestTracks = data.guestTracks
	studio.status = 'ready'
}

// After a save or follow from a public page. Only a
// Studio that already loaded needs the fresh copy.
export const refreshStudio = async () => {
	const isReady = studio.status === 'ready'
	if (!isReady) return
	const data = await api.getStudio()
	applyData(data)
}

export const loadStudio = async () => {
	try {
		const me = await api.getMe()

		if (!me) {
			studio.status = 'signed-out'
			return
		}

		studio.email = me.email
		const hasArtist = me.artist !== null

		if (!hasArtist) {
			studio.status = 'no-artist'
			return
		}

		const data = await api.getStudio()
		applyData(data)
	} catch (loadError) {
		console.error('femes: studio failed to load', loadError)
		studio.status = 'failed'
	}
}

// Loads once per visit. Pages call it on the way in.
export const ensureStudio = () => {
	if (hasLoaded) return
	hasLoaded = true
	loadStudio()
}

export const createArtist = async (name: string, slug: string) => {
	await api.createArtist(name, slug)
	const data = await api.getStudio()
	applyData(data)
}

export const updateArtist = async (changes: api.ArtistChangesT) => {
	const result = await api.updateArtist(changes)
	studio.artist = result.artist
}

export const signOutOfStudio = async () => {
	await api.signOut()
	studio.status = 'signed-out'
	studio.artist = null
	studio.tracks = []
	studio.playlists = []
	studio.savedTracks = []
	studio.guestTracks = []
}

// ---------- tracks ----------

const replaceTrack = (track: FemesTrackT) => {
	const pickTrack = (entry: FemesTrackT) => {
		const isReplaced = entry.id === track.id
		if (isReplaced) return track
		return entry
	}

	studio.tracks = studio.tracks.map(pickTrack)
}

export const addTrack = async (title: string, audioKey: string, duration: number) => {
	const result = await api.createTrack(title, audioKey, duration)
	studio.tracks = [result.track, ...studio.tracks]
	return result.track
}

export const updateTrack = async (trackId: string, changes: api.TrackChangesT) => {
	const result = await api.updateTrack(trackId, changes)
	replaceTrack(result.track)
	return result.track
}

export const removeTrack = async (trackId: string) => {
	await api.deleteTrack(trackId)
	studio.tracks = studio.tracks.filter((track) => track.id !== trackId)

	const withoutTrack = (playlist: PlaylistT) => {
		const trackIds = playlist.trackIds.filter((id) => id !== trackId)
		return { ...playlist, trackIds }
	}

	studio.playlists = studio.playlists.map(withoutTrack)
}

// Moves one track in the list and saves the new order.
export const moveTrack = async (fromIndex: number, toIndex: number) => {
	const reordered = [...studio.tracks]
	const moved = reordered.splice(fromIndex, 1)
	reordered.splice(toIndex, 0, ...moved)
	studio.tracks = reordered
	const ids = reordered.map((track) => track.id)
	await api.reorderTracks(ids)
}

// ---------- playlists ----------

const replacePlaylist = (playlistId: string, changes: Partial<PlaylistT>) => {
	const applyChanges = (playlist: PlaylistT) => {
		const isChanged = playlist.id === playlistId
		if (!isChanged) return playlist
		return { ...playlist, ...changes }
	}

	studio.playlists = studio.playlists.map(applyChanges)
}

export const addPlaylist = async (changes: api.PlaylistChangesT) => {
	const result = await api.createPlaylist(changes)
	studio.playlists = [result.playlist, ...studio.playlists]
	return result.playlist
}

// Fields come back from a full reload, since a rename
// changes the playlist's link too.
export const updatePlaylist = async (playlistId: string, changes: api.PlaylistChangesT) => {
	await api.updatePlaylist(playlistId, changes)
	const data = await api.getStudio()
	applyData(data)
}

export const removePlaylist = async (playlistId: string) => {
	await api.deletePlaylist(playlistId)
	studio.playlists = studio.playlists.filter((playlist) => playlist.id !== playlistId)
}

export const setPlaylistTracks = async (playlistId: string, trackIds: string[]) => {
	replacePlaylist(playlistId, { trackIds })
	const result = await api.setPlaylistTracks(playlistId, trackIds)
	replacePlaylist(playlistId, { trackIds: result.trackIds })
}

// Own tracks first, then other artists' songs the
// artist saved or already put in a playlist.
export const findTrack = (trackId: string) => {
	const isMatch = (track: FemesTrackT) => track.id === trackId
	const ownTrack = studio.tracks.find(isMatch)
	if (ownTrack) return ownTrack
	const savedTrack = studio.savedTracks.find(isMatch)
	if (savedTrack) return savedTrack
	return studio.guestTracks.find(isMatch)
}

// Other artists' songs a playlist can take: saved ones,
// plus ones already in a playlist.
export const listPickableGuestTracks = (): FemesTrackT[] => {
	const savedIds = new Set(studio.savedTracks.map((track) => track.id))
	const unsavedGuests = studio.guestTracks.filter((track) => !savedIds.has(track.id))
	return [...studio.savedTracks, ...unsavedGuests]
}
