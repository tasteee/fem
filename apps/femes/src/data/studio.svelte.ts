import { replacePath } from '../routing/router.svelte'
import { buildArtistPath, buildPlaylistPath } from '../routing/routes'
import * as api from './studio-api'
import type { ArtistT, FemesTrackT, PlaylistT } from './types'

// The signed-in artist's own things. Their pages read it
// to show manage controls; actions call the API, then
// update it with what came back. Listeners never load
// more than one quick "who am I" check.

export type StudioStatusT = 'loading' | 'signed-out' | 'no-artist' | 'ready' | 'failed'

type StudioStateT = {
	status: StudioStatusT
	email: string
	artist: ArtistT | null
	tracks: FemesTrackT[]
	playlists: PlaylistT[]
	savedTracks: FemesTrackT[]
	guestTracks: FemesTrackT[]
	savedTrackIds: string[]
	followingIds: string[]
}

export const studio = $state<StudioStateT>({
	status: 'loading',
	email: '',
	artist: null,
	tracks: [],
	playlists: [],
	savedTracks: [],
	guestTracks: [],
	savedTrackIds: [],
	followingIds: []
})

const isDemo = import.meta.env.VITE_CATALOG === 'demo'

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
	if (isDemo) {
		studio.status = 'signed-out'
		return
	}

	try {
		const me = await api.getMe()

		if (!me) {
			studio.status = 'signed-out'
			return
		}

		studio.email = me.email
		studio.savedTrackIds = me.savedTrackIds
		studio.followingIds = me.followingIds
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

// A new link moves the page you're on along with it.
export const updateArtist = async (changes: api.ArtistChangesT) => {
	const oldSlug = studio.artist?.slug ?? ''
	const result = await api.updateArtist(changes)
	studio.artist = result.artist
	const oldPrefix = buildArtistPath(oldSlug)
	const pathname = window.location.pathname
	const isOnOldPage = pathname === oldPrefix || pathname.startsWith(`${oldPrefix}/`)
	const isSlugChanged = result.artist.slug !== oldSlug
	const shouldMove = isOnOldPage && isSlugChanged
	if (!shouldMove) return
	const newPath = buildArtistPath(result.artist.slug) + pathname.slice(oldPrefix.length)
	replacePath(newPath)
}

export const signOutOfStudio = async () => {
	await api.signOut()
	studio.status = 'signed-out'
	studio.artist = null
	studio.tracks = []
	studio.playlists = []
	studio.savedTracks = []
	studio.guestTracks = []
	studio.savedTrackIds = []
	studio.followingIds = []
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

// A rename changes the track's link. If you're on its
// page, the address follows.
export const updateTrack = async (trackId: string, changes: api.TrackChangesT) => {
	const oldHref = findTrack(trackId)?.href ?? ''
	const result = await api.updateTrack(trackId, changes)
	replaceTrack(result.track)
	const newHref = result.track.href ?? ''
	const isOnOldPage = window.location.pathname === oldHref
	const hasMoved = isOnOldPage && newHref !== oldHref
	if (hasMoved) replacePath(newHref)
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

export const findPlaylist = (playlistId: string) => studio.playlists.find((playlist) => playlist.id === playlistId)

export const buildOwnPlaylistPath = (playlistId: string): string => {
	const artistSlug = studio.artist?.slug ?? ''
	const playlist = findPlaylist(playlistId)
	if (!playlist) return buildArtistPath(artistSlug)
	return buildPlaylistPath(artistSlug, playlist.slug)
}

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
	const oldPath = buildOwnPlaylistPath(playlistId)
	await api.updatePlaylist(playlistId, changes)
	const data = await api.getStudio()
	applyData(data)
	const newPath = buildOwnPlaylistPath(playlistId)
	const isOnOldPage = window.location.pathname === oldPath
	const hasMoved = isOnOldPage && newPath !== oldPath
	if (hasMoved) replacePath(newPath)
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

// ---------- ownership ----------

export const checkIsSignedInArtist = (): boolean => studio.status === 'ready'

// True on the signed-in artist's own pages.
export const checkIsOwnSlug = (artistSlug: string): boolean => {
	const ownSlug = studio.artist?.slug
	if (!ownSlug) return false
	return ownSlug === artistSlug
}

export const findOwnTrackBySlug = (trackSlug: string) => studio.tracks.find((track) => track.slug === trackSlug)
export const findOwnPlaylistBySlug = (playlistSlug: string) => studio.playlists.find((playlist) => playlist.slug === playlistSlug)

// Tracks in a playlist, in its order. Ones that went
// private or were deleted drop out.
export const listPlaylistTracks = (playlist: PlaylistT): FemesTrackT[] => {
	const foundTracks = playlist.trackIds.map(findTrack)
	return foundTracks.filter((track): track is FemesTrackT => track !== undefined)
}
