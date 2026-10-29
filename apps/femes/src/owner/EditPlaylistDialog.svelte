<script lang="ts">
	import { updatePlaylist } from '../data/studio.svelte'
	import { getErrorReason, uploadFile } from '../data/studio-api'
	import type { PlaylistT, VisibilityT } from '../data/types'
	import { readValue } from '../parts/read-value'

	type EditPlaylistDialogPropsT = {
		playlist: PlaylistT | undefined
		onClose: () => void
		onDelete: (playlist: PlaylistT) => void
	}

	const props: EditPlaylistDialogPropsT = $props()

	let name = $state('')
	let description = $state('')
	let visibility = $state<VisibilityT>('public')
	let coverKey = $state<string | undefined>(undefined)
	let isUploadingCover = $state(false)
	let isSaving = $state(false)
	let failure = $state('')

	// Opening fills the form from the playlist.
	$effect(() => {
		const playlist = props.playlist
		if (!playlist) return
		name = playlist.name
		description = playlist.description
		visibility = playlist.visibility
		coverKey = undefined
		failure = ''
	})

	const isOpen = $derived(props.playlist !== undefined)
	const coverSource = $derived(props.playlist?.coverUrl ?? '')
	const hasFailure = $derived(failure !== '')
	const isBusy = $derived(isSaving || isUploadingCover)

	const visibilityHelp: Record<VisibilityT, string> = {
		public: 'Shows on your page.',
		unlisted: 'Works by link only. Hidden from your page.',
		private: 'Only you can see it.'
	}

	const shownHelp = $derived(visibilityHelp[visibility])

	const handleNameInput = (event: Event) => {
		name = readValue(event)
	}

	const handleDescriptionInput = (event: Event) => {
		description = readValue(event)
	}

	const handleVisibilityChange = (event: Event) => {
		visibility = readValue(event) as VisibilityT
	}

	const handleCoverChange = async (event: Event) => {
		const detail = (event as CustomEvent<{ files: File[] }>).detail
		const file = detail.files[0]
		if (!file) return
		isUploadingCover = true
		const ignoreProgress = () => {}

		try {
			coverKey = await uploadFile(file, 'image', ignoreProgress)
		} catch (uploadError) {
			failure = `Cover didn't upload (${getErrorReason(uploadError)}).`
		} finally {
			isUploadingCover = false
		}
	}

	const handleSave = async () => {
		const playlist = props.playlist
		if (!playlist) return
		isSaving = true
		failure = ''

		try {
			await updatePlaylist(playlist.id, { name, description, visibility, coverKey })
			props.onClose()
		} catch (saveError) {
			failure = `Couldn't save (${getErrorReason(saveError)}).`
		} finally {
			isSaving = false
		}
	}

	const handleDelete = () => {
		const playlist = props.playlist
		if (playlist) props.onDelete(playlist)
	}
</script>

<fem-dialog class="studio-dialog isWide" open={isOpen} heading="Edit playlist" onclose={props.onClose}>
	<fem-column gap="5">
		<div class="edit-track">
			<fem-field label="Cover">
				<fem-file-upload kind="image" accept="image/*" label="Add cover" src={coverSource} onchange={handleCoverChange}></fem-file-upload>
			</fem-field>
			<fem-column gap="4">
				<fem-field label="Name" help="Renaming keeps the old link working.">
					<fem-input value={name} oninput={handleNameInput}></fem-input>
				</fem-field>
				<fem-field label="Description">
					<fem-textarea autosize maxlength={1000} value={description} oninput={handleDescriptionInput}></fem-textarea>
				</fem-field>
			</fem-column>
		</div>
		<fem-field label="Who can listen" help={shownHelp}>
			<fem-segmented value={visibility} onchange={handleVisibilityChange}>
				<fem-segment value="public">Public</fem-segment>
				<fem-segment value="unlisted">Unlisted</fem-segment>
				<fem-segment value="private">Private</fem-segment>
			</fem-segmented>
		</fem-field>
		{#if hasFailure}
			<fem-text size="small" color="danger">{failure}</fem-text>
		{/if}
	</fem-column>
	<fem-button slot="actions" kind="ghost" color="danger" onclick={handleDelete}>Delete</fem-button>
	<fem-button slot="actions" kind="soft" onclick={props.onClose}>Cancel</fem-button>
	<fem-button slot="actions" loading={isSaving} disabled={isBusy} onclick={handleSave}>Save</fem-button>
</fem-dialog>
