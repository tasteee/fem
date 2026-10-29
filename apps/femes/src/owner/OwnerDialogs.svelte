<script lang="ts">
	import { showToast } from '@tasteee/fem'
	import { removePlaylist, removeTrack, setPlaylistTracks, studio } from '../data/studio.svelte'
	import { getErrorReason } from '../data/studio-api'
	import { navigate } from '../routing/router.svelte'
	import { buildArtistPath, buildPlaylistPath } from '../routing/routes'
	import AddToPlaylistDialog from './AddToPlaylistDialog.svelte'
	import AddTracksDialog from './AddTracksDialog.svelte'
	import ConfirmDialog from './ConfirmDialog.svelte'
	import EditPlaylistDialog from './EditPlaylistDialog.svelte'
	import EditProfileDialog from './EditProfileDialog.svelte'
	import EditTrackDialog from './EditTrackDialog.svelte'
	import NewPlaylistDialog from './NewPlaylistDialog.svelte'
	import * as dialogs from './owner-dialogs.svelte'
	import UploadDialog from './UploadDialog.svelte'

	// Every manage dialog, drawn once for the signed-in
	// artist. Pages open them through owner-dialogs.
	const openDialogs = dialogs.ownerDialogs
	let isDeleting = $state(false)

	const ownPagePath = $derived(buildArtistPath(studio.artist?.slug ?? ''))
	const isDeleteTrackOpen = $derived(openDialogs.deletingTrack !== undefined)
	const isDeletePlaylistOpen = $derived(openDialogs.deletingPlaylist !== undefined)
	const deleteTrackHeading = $derived(`Delete “${openDialogs.deletingTrack?.title ?? ''}”?`)
	const deletePlaylistHeading = $derived(`Delete “${openDialogs.deletingPlaylist?.name ?? ''}”?`)
	const isFillOpen = $derived(openDialogs.fillingPlaylist !== undefined)
	const fillChosenIds = $derived(openDialogs.fillingPlaylist?.trackIds ?? [])

	// Deleting the page you're on sends you back to your
	// own page.
	const leaveIfOnPath = (path: string) => {
		const isOnPath = window.location.pathname === path
		if (isOnPath) navigate(ownPagePath)
	}

	const confirmDeleteTrack = async () => {
		const track = openDialogs.deletingTrack
		if (!track) return
		isDeleting = true

		try {
			await removeTrack(track.id)
			dialogs.closeDeleteTrack()
			leaveIfOnPath(track.href ?? '')
			showToast(`Deleted ${track.title}`)
		} catch (deleteError) {
			showToast(`Couldn't delete (${getErrorReason(deleteError)}).`)
		} finally {
			isDeleting = false
		}
	}

	const confirmDeletePlaylist = async () => {
		const playlist = openDialogs.deletingPlaylist
		if (!playlist) return
		const playlistPath = buildPlaylistPath(playlist.artistSlug, playlist.slug)
		isDeleting = true

		try {
			await removePlaylist(playlist.id)
			dialogs.closeDeletePlaylist()
			leaveIfOnPath(playlistPath)
			showToast(`Deleted ${playlist.name}`)
		} catch (deleteError) {
			showToast(`Couldn't delete (${getErrorReason(deleteError)}).`)
		} finally {
			isDeleting = false
		}
	}

	const saveFilledTracks = async (trackIds: string[]) => {
		const playlist = openDialogs.fillingPlaylist
		dialogs.closeFillPlaylist()
		if (!playlist) return

		try {
			await setPlaylistTracks(playlist.id, trackIds)
		} catch (saveError) {
			showToast(`Couldn't update tracks (${getErrorReason(saveError)}).`)
		}
	}
</script>

<UploadDialog open={openDialogs.isUploadOpen} onClose={dialogs.closeUpload} />
<EditProfileDialog open={openDialogs.isProfileOpen} onClose={dialogs.closeProfile} />
<EditTrackDialog track={openDialogs.editingTrack} onClose={dialogs.closeEditTrack} onDelete={dialogs.openDeleteTrack} />
<AddToPlaylistDialog track={openDialogs.pickingPlaylistFor} onNewPlaylist={dialogs.openNewPlaylist} onClose={dialogs.closeAddToPlaylist} />
<NewPlaylistDialog open={openDialogs.isNewPlaylistOpen} trackId={openDialogs.newPlaylistTrackId} onClose={dialogs.closeNewPlaylist} />
<EditPlaylistDialog playlist={openDialogs.editingPlaylist} onClose={dialogs.closeEditPlaylist} onDelete={dialogs.openDeletePlaylist} />
<AddTracksDialog open={isFillOpen} chosenIds={fillChosenIds} onSave={saveFilledTracks} onClose={dialogs.closeFillPlaylist} />
<ConfirmDialog
	open={isDeleteTrackOpen}
	heading={deleteTrackHeading}
	message="The track, its artwork, and its link go away for everyone. It also leaves any playlists. This can't be undone."
	confirmLabel="Delete track"
	isWorking={isDeleting}
	onConfirm={confirmDeleteTrack}
	onClose={dialogs.closeDeleteTrack}
/>
<ConfirmDialog
	open={isDeletePlaylistOpen}
	heading={deletePlaylistHeading}
	message="The playlist and its link go away. Its tracks stay on your page."
	confirmLabel="Delete playlist"
	isWorking={isDeleting}
	onConfirm={confirmDeletePlaylist}
	onClose={dialogs.closeDeletePlaylist}
/>
