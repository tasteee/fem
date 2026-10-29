import type { FemesTrackT, PlaylistT } from '../data/types'

// Which manage dialog is open. Any page or menu opens
// one by name; OwnerDialogs draws them all, once, for
// the signed-in artist.

type OwnerDialogsT = {
	isUploadOpen: boolean
	isProfileOpen: boolean
	editingTrack: FemesTrackT | undefined
	deletingTrack: FemesTrackT | undefined
	pickingPlaylistFor: FemesTrackT | undefined
	isNewPlaylistOpen: boolean
	newPlaylistTrackId: string
	editingPlaylist: PlaylistT | undefined
	deletingPlaylist: PlaylistT | undefined
	fillingPlaylist: PlaylistT | undefined
}

export const ownerDialogs = $state<OwnerDialogsT>({
	isUploadOpen: false,
	isProfileOpen: false,
	editingTrack: undefined,
	deletingTrack: undefined,
	pickingPlaylistFor: undefined,
	isNewPlaylistOpen: false,
	newPlaylistTrackId: '',
	editingPlaylist: undefined,
	deletingPlaylist: undefined,
	fillingPlaylist: undefined
})

export const openUpload = () => (ownerDialogs.isUploadOpen = true)
export const closeUpload = () => (ownerDialogs.isUploadOpen = false)
export const openProfile = () => (ownerDialogs.isProfileOpen = true)
export const closeProfile = () => (ownerDialogs.isProfileOpen = false)

export const openEditTrack = (track: FemesTrackT) => (ownerDialogs.editingTrack = track)
export const closeEditTrack = () => (ownerDialogs.editingTrack = undefined)

// Delete always asks first. It replaces the edit dialog
// when opened from there.
export const openDeleteTrack = (track: FemesTrackT) => {
	ownerDialogs.editingTrack = undefined
	ownerDialogs.deletingTrack = track
}

export const closeDeleteTrack = () => (ownerDialogs.deletingTrack = undefined)

export const openAddToPlaylist = (track: FemesTrackT) => (ownerDialogs.pickingPlaylistFor = track)
export const closeAddToPlaylist = () => (ownerDialogs.pickingPlaylistFor = undefined)

// "New playlist…" can start with a track already in it.
export const openNewPlaylist = (trackId = '') => {
	ownerDialogs.pickingPlaylistFor = undefined
	ownerDialogs.newPlaylistTrackId = trackId
	ownerDialogs.isNewPlaylistOpen = true
}

export const closeNewPlaylist = () => {
	ownerDialogs.isNewPlaylistOpen = false
	ownerDialogs.newPlaylistTrackId = ''
}

export const openEditPlaylist = (playlist: PlaylistT) => (ownerDialogs.editingPlaylist = playlist)
export const closeEditPlaylist = () => (ownerDialogs.editingPlaylist = undefined)

export const openDeletePlaylist = (playlist: PlaylistT) => {
	ownerDialogs.editingPlaylist = undefined
	ownerDialogs.deletingPlaylist = playlist
}

export const closeDeletePlaylist = () => (ownerDialogs.deletingPlaylist = undefined)

export const openFillPlaylist = (playlist: PlaylistT) => (ownerDialogs.fillingPlaylist = playlist)
export const closeFillPlaylist = () => (ownerDialogs.fillingPlaylist = undefined)
