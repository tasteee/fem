<script lang="ts">
	import { formatDuration } from '@tasteee/fem/foundation'
	import { showToast } from '@tasteee/fem'
	import { moveTrack, removeTrack, studio } from '../../data/studio.svelte'
	import { getErrorReason } from '../../data/studio-api'
	import type { FemesTrackT } from '../../data/types'
	import ConfirmDialog from './ConfirmDialog.svelte'
	import EditTrackDialog from './EditTrackDialog.svelte'
	import StudioShell from './StudioShell.svelte'
	import UploadDialog from './UploadDialog.svelte'

	type ReorderDetailT = { from: number; to: number }

	let isUploadOpen = $state(false)
	let editingTrack = $state<FemesTrackT | undefined>(undefined)
	let deletingTrack = $state<FemesTrackT | undefined>(undefined)
	let isDeleting = $state(false)

	const trackCount = $derived(studio.tracks.length)
	const hasTracks = $derived(trackCount > 0)
	const isDeleteOpen = $derived(deletingTrack !== undefined)
	const deleteHeading = $derived(`Delete “${deletingTrack?.title ?? ''}”?`)

	const visibilityLabels = { public: '', unlisted: 'Unlisted', private: 'Private' }

	const describeTrack = (track: FemesTrackT): string => {
		const parts = [track.genre, visibilityLabels[track.visibility]]
		return parts.filter((part) => part !== '').join(' · ')
	}

	const getDurationLabel = (track: FemesTrackT) => formatDuration(track.duration ?? 0)

	const openUpload = () => {
		isUploadOpen = true
	}

	const closeUpload = () => {
		isUploadOpen = false
	}

	const closeEdit = () => {
		editingTrack = undefined
	}

	const closeDelete = () => {
		deletingTrack = undefined
	}

	const askToDelete = (track: FemesTrackT) => {
		editingTrack = undefined
		deletingTrack = track
	}

	const handleReorder = async (event: Event) => {
		const detail = (event as CustomEvent<ReorderDetailT>).detail

		try {
			await moveTrack(detail.from, detail.to)
		} catch (moveError) {
			showToast(`Couldn't save the new order (${getErrorReason(moveError)}).`)
		}
	}

	const copyTrackLink = async (track: FemesTrackT) => {
		const link = `${window.location.origin}${track.href}`
		await navigator.clipboard.writeText(link)
		showToast('Link copied')
	}

	const confirmDelete = async () => {
		const track = deletingTrack
		if (!track) return
		isDeleting = true

		try {
			await removeTrack(track.id)
			showToast(`Deleted ${track.title}`)
			deletingTrack = undefined
		} catch (deleteError) {
			showToast(`Couldn't delete (${getErrorReason(deleteError)}).`)
		} finally {
			isDeleting = false
		}
	}
</script>

<StudioShell section="tracks">
	<div class="studio-toolbar">
		<fem-heading level={1} size="heading">Tracks</fem-heading>
		<span class="numeric muted">{trackCount}</span>
		<span class="studio-toolbar-spacer"></span>
		<fem-button onclick={openUpload}>
			<fem-icon name="upload-simple"></fem-icon>
			Upload
		</fem-button>
	</div>

	{#if hasTracks}
		<fem-text size="small" color="muted">Drag to reorder. Your profile shows tracks in this order.</fem-text>
		<fem-card class="studio-list">
			<fem-sortable label="Your tracks" gap="0" onreorder={handleReorder}>
				{#each studio.tracks as track (track.id)}
					<fem-list-item interactive label={track.title} description={describeTrack(track)} onselect={() => (editingTrack = track)}>
						<button slot="leading" class="studio-grip" type="button" data-sortable-handle aria-label="Drag to reorder"><fem-icon name="dots-six-vertical"></fem-icon></button>
						<fem-image slot="leading" class="studio-row-art" src={track.artwork} alt="" radius="small"></fem-image>
						<span slot="meta">{getDurationLabel(track)}</span>
						<fem-menu slot="trailing">
							<fem-button slot="trigger" kind="ghost" shape="circle" size="small" label="Track actions">
								<fem-icon name="dots-three"></fem-icon>
							</fem-button>
							<fem-menu-item onclick={() => (editingTrack = track)}>Edit details</fem-menu-item>
							<fem-menu-item onclick={() => copyTrackLink(track)}>Copy link</fem-menu-item>
							<fem-menu-item color="danger" onclick={() => askToDelete(track)}>Delete</fem-menu-item>
						</fem-menu>
					</fem-list-item>
				{/each}
			</fem-sortable>
		</fem-card>
	{:else}
		<fem-card class="studio-empty">
			<fem-empty-state heading="Your first track">
				<fem-icon slot="icon" name="music-notes"></fem-icon>
				Upload audio and get a link anyone can listen to. No account needed to listen.
				<fem-button slot="actions" onclick={openUpload}>Upload tracks</fem-button>
			</fem-empty-state>
		</fem-card>
	{/if}
</StudioShell>

<UploadDialog open={isUploadOpen} onClose={closeUpload} />
<EditTrackDialog track={editingTrack} onClose={closeEdit} onDelete={askToDelete} />
<ConfirmDialog
	open={isDeleteOpen}
	heading={deleteHeading}
	message="The track, its artwork, and its link go away for everyone. It also leaves any playlists. This can't be undone."
	confirmLabel="Delete track"
	isWorking={isDeleting}
	onConfirm={confirmDelete}
	onClose={closeDelete}
/>
