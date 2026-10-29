<script lang="ts">
	import { showToast } from '@tasteee/fem'
	import { formatDuration } from '@tasteee/fem/foundation'
	import { findTrack, removePlaylist, setPlaylistTracks, studio, updatePlaylist } from '../../data/studio.svelte'
	import { getErrorReason, uploadFile } from '../../data/studio-api'
	import type { FemesTrackT, PlaylistT, VisibilityT } from '../../data/types'
	import { formatTrackCount } from '../../parts/format-count'
	import { readValue } from '../../parts/read-value'
	import { navigate } from '../../routing/router.svelte'
	import { buildPlaylistPath, buildStudioPlaylistPath, studioPaths } from '../../routing/routes'
	import AddTracksDialog from './AddTracksDialog.svelte'
	import ConfirmDialog from './ConfirmDialog.svelte'
	import NewPlaylistDialog from './NewPlaylistDialog.svelte'
	import StudioShell from './StudioShell.svelte'

	type StudioPlaylistsPagePropsT = {
		playlistId: string
	}

	type ReorderDetailT = { from: number; to: number }

	const props: StudioPlaylistsPagePropsT = $props()

	let isNewOpen = $state(false)
	let isAddOpen = $state(false)
	let isDeleteOpen = $state(false)
	let isDeleting = $state(false)
	let isSaving = $state(false)
	let name = $state('')
	let description = $state('')
	let visibility = $state<VisibilityT>('public')
	let coverKey = $state<string | undefined>(undefined)

	// The playlist in the address, else the newest one.
	const selected = $derived<PlaylistT | undefined>(studio.playlists.find((playlist) => playlist.id === props.playlistId) ?? studio.playlists[0])
	const hasPlaylists = $derived(studio.playlists.length > 0)

	$effect(() => {
		const playlist = selected
		if (!playlist) return
		name = playlist.name
		description = playlist.description
		visibility = playlist.visibility
		coverKey = undefined
	})

	const selectedTracks = $derived.by(() => {
		const playlist = selected
		if (!playlist) return []
		const foundTracks = playlist.trackIds.map(findTrack)
		return foundTracks.filter((track): track is FemesTrackT => track !== undefined)
	})

	const summary = $derived.by(() => {
		const durations = selectedTracks.map((track) => track.duration ?? 0)
		const totalSeconds = durations.reduce((sum, seconds) => sum + seconds, 0)
		return `${formatTrackCount(selectedTracks.length)} · ${formatDuration(totalSeconds)}`
	})

	const publicLink = $derived.by(() => {
		const artist = studio.artist
		const playlist = selected
		if (!artist || !playlist) return ''
		return `${window.location.origin}${buildPlaylistPath(artist.slug, playlist.slug)}`
	})

	const deleteHeading = $derived(`Delete “${selected?.name ?? ''}”?`)
	const isPublic = $derived(visibility === 'public')

	// ---------- handlers ----------

	const openPlaylist = (playlist: PlaylistT) => navigate(buildStudioPlaylistPath(playlist.id))

	const handleNameInput = (event: Event) => {
		name = readValue(event)
	}

	const handleDescriptionInput = (event: Event) => {
		description = readValue(event)
	}

	const handlePublicChange = (event: Event) => {
		const toggle = event.currentTarget as HTMLElement & { checked: boolean }
		visibility = toggle.checked ? 'public' : 'unlisted'
	}

	const handleCoverChange = async (event: Event) => {
		const detail = (event as CustomEvent<{ files: File[] }>).detail
		const file = detail.files[0]
		if (!file) return
		const ignoreProgress = () => {}

		try {
			coverKey = await uploadFile(file, 'image', ignoreProgress)
		} catch (uploadError) {
			showToast(`Cover didn't upload (${getErrorReason(uploadError)}).`)
		}
	}

	const handleSave = async () => {
		const playlist = selected
		if (!playlist) return
		isSaving = true

		try {
			await updatePlaylist(playlist.id, { name, description, visibility, coverKey })
			showToast('Saved')
		} catch (saveError) {
			showToast(`Couldn't save (${getErrorReason(saveError)}).`)
		} finally {
			isSaving = false
		}
	}

	const saveTrackIds = async (trackIds: string[]) => {
		const playlist = selected
		if (!playlist) return

		try {
			await setPlaylistTracks(playlist.id, trackIds)
		} catch (saveError) {
			showToast(`Couldn't update tracks (${getErrorReason(saveError)}).`)
		}
	}

	const handleReorder = (event: Event) => {
		const detail = (event as CustomEvent<ReorderDetailT>).detail
		const ids = selectedTracks.map((track) => track.id)
		const moved = ids.splice(detail.from, 1)
		ids.splice(detail.to, 0, ...moved)
		saveTrackIds(ids)
	}

	const removeFromPlaylist = (track: FemesTrackT) => {
		const ids = selectedTracks.map((entry) => entry.id)
		const remaining = ids.filter((id) => id !== track.id)
		saveTrackIds(remaining)
	}

	const handleAddSave = (trackIds: string[]) => {
		isAddOpen = false
		saveTrackIds(trackIds)
	}

	const copyLink = async () => {
		await navigator.clipboard.writeText(publicLink)
		showToast('Link copied')
	}

	const confirmDelete = async () => {
		const playlist = selected
		if (!playlist) return
		isDeleting = true

		try {
			await removePlaylist(playlist.id)
			isDeleteOpen = false
			navigate(studioPaths.playlists)
		} catch (deleteError) {
			showToast(`Couldn't delete (${getErrorReason(deleteError)}).`)
		} finally {
			isDeleting = false
		}
	}

	const openNew = () => (isNewOpen = true)
	const closeNew = () => (isNewOpen = false)
	const openAdd = () => (isAddOpen = true)
	const closeAdd = () => (isAddOpen = false)
	const openDelete = () => (isDeleteOpen = true)
	const closeDelete = () => (isDeleteOpen = false)
</script>

<StudioShell section="playlists">
	<div class="studio-toolbar">
		<fem-heading level={1} size="heading">Playlists</fem-heading>
		<span class="studio-toolbar-spacer"></span>
		<fem-button kind="soft" onclick={openNew}>
			<fem-icon name="plus"></fem-icon>
			New playlist
		</fem-button>
	</div>

	{#if !hasPlaylists}
		<fem-card class="studio-empty">
			<fem-empty-state heading="No playlists yet">
				<fem-icon slot="icon" name="list"></fem-icon>
				Group tracks for a release, a mood, or a set of drafts.
				<fem-button slot="actions" onclick={openNew}>New playlist</fem-button>
			</fem-empty-state>
		</fem-card>
	{:else if selected}
		<div class="playlist-studio">
			<nav class="playlist-picker" aria-label="Your playlists">
				{#each studio.playlists as playlist (playlist.id)}
					{@const isCurrent = playlist.id === selected.id}
					<fem-list-item interactive selected={isCurrent} label={playlist.name} description={formatTrackCount(playlist.trackIds.length)} onselect={() => openPlaylist(playlist)}>
						<fem-image slot="leading" class="studio-row-art" src={playlist.coverUrl} alt="" radius="small"></fem-image>
					</fem-list-item>
				{/each}
			</nav>

			<fem-card class="playlist-editor">
				<div class="playlist-editor-head">
					<fem-field label="Cover">
						<fem-file-upload class="playlist-cover-upload" kind="image" accept="image/*" label="Add cover" src={selected.coverUrl} onchange={handleCoverChange}></fem-file-upload>
					</fem-field>
					<fem-column gap="4" grow>
						<fem-field label="Name">
							<fem-input value={name} oninput={handleNameInput}></fem-input>
						</fem-field>
						<fem-field label="Description">
							<fem-textarea autosize maxlength={1000} value={description} oninput={handleDescriptionInput}></fem-textarea>
						</fem-field>
						<fem-switch checked={isPublic} onchange={handlePublicChange}>Public · shows on your profile</fem-switch>
					</fem-column>
				</div>
				<fem-field label="Link" help="Renaming keeps the old link working.">
					<fem-copy-field value={publicLink} shareable shareTitle={selected.name}></fem-copy-field>
				</fem-field>
				<fem-row gap="2" align-x="end">
					<fem-button kind="ghost" color="danger" onclick={openDelete}>Delete playlist</fem-button>
					<fem-button loading={isSaving} onclick={handleSave}>Save</fem-button>
				</fem-row>

				<fem-row align-y="center" gap="2">
					<span class="section-label">{summary}</span>
					<span class="studio-toolbar-spacer"></span>
					<fem-button size="small" kind="soft" onclick={openAdd}>Add or remove tracks</fem-button>
				</fem-row>
				<fem-sortable label="Playlist order" gap="0" onreorder={handleReorder}>
					{#each selectedTracks as track (track.id)}
						<fem-list-item label={track.title}>
							<button slot="leading" class="studio-grip" type="button" data-sortable-handle aria-label="Drag to reorder"><fem-icon name="dots-six-vertical"></fem-icon></button>
							<fem-image slot="leading" class="studio-row-art" src={track.artwork} alt="" radius="small"></fem-image>
							<span slot="meta">{formatDuration(track.duration ?? 0)}</span>
							<fem-button slot="trailing" kind="ghost" shape="circle" size="small" label={`Remove ${track.title}`} onclick={() => removeFromPlaylist(track)}>
								<fem-icon name="x"></fem-icon>
							</fem-button>
						</fem-list-item>
					{/each}
				</fem-sortable>
			</fem-card>
		</div>
	{/if}
</StudioShell>

<NewPlaylistDialog open={isNewOpen} onClose={closeNew} />
<AddTracksDialog open={isAddOpen} chosenIds={selected?.trackIds ?? []} onSave={handleAddSave} onClose={closeAdd} />
<ConfirmDialog
	open={isDeleteOpen}
	heading={deleteHeading}
	message="The playlist and its link go away. Its tracks stay in your library."
	confirmLabel="Delete playlist"
	isWorking={isDeleting}
	onConfirm={confirmDelete}
	onClose={closeDelete}
/>
