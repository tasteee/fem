<script lang="ts">
	import { updateTrack } from '../../data/studio.svelte'
	import { getErrorReason, uploadFile } from '../../data/studio-api'
	import type { FemesTrackT, VisibilityT } from '../../data/types'
	import { readValue } from '../../parts/read-value'

	type EditTrackDialogPropsT = {
		track: FemesTrackT | undefined
		onClose: () => void
		onDelete: (track: FemesTrackT) => void
	}

	const props: EditTrackDialogPropsT = $props()

	let title = $state('')
	let genre = $state('')
	let description = $state('')
	let visibility = $state<VisibilityT>('public')
	let artworkKey = $state<string | undefined>(undefined)
	let isUploadingArtwork = $state(false)
	let isSaving = $state(false)
	let failure = $state('')

	// A new track fills the form with its current details.
	$effect(() => {
		const track = props.track
		if (!track) return
		title = track.title
		genre = track.genre
		description = track.description
		visibility = track.visibility
		artworkKey = undefined
		failure = ''
	})

	const isOpen = $derived(props.track !== undefined)
	const artworkSource = $derived(props.track?.artwork ?? '')
	const hasFailure = $derived(failure !== '')
	const isBusy = $derived(isSaving || isUploadingArtwork)

	const visibilityHelp: Record<VisibilityT, string> = {
		public: 'Shows on your profile.',
		unlisted: 'Works by link only. Hidden from your profile.',
		private: 'Only you can see it.'
	}

	const shownHelp = $derived(visibilityHelp[visibility])

	const handleTitleInput = (event: Event) => {
		title = readValue(event)
	}

	const handleGenreInput = (event: Event) => {
		genre = readValue(event)
	}

	const handleDescriptionInput = (event: Event) => {
		description = readValue(event)
	}

	const handleVisibilityChange = (event: Event) => {
		visibility = readValue(event) as VisibilityT
	}

	// Artwork uploads as soon as it's picked, so Save is
	// quick.
	const handleArtworkChange = async (event: Event) => {
		const detail = (event as CustomEvent<{ files: File[] }>).detail
		const file = detail.files[0]
		if (!file) return
		isUploadingArtwork = true
		const ignoreProgress = () => {}

		try {
			artworkKey = await uploadFile(file, 'image', ignoreProgress)
		} catch (uploadError) {
			failure = `Artwork didn't upload (${getErrorReason(uploadError)}).`
		} finally {
			isUploadingArtwork = false
		}
	}

	const handleSave = async () => {
		const track = props.track
		if (!track) return
		isSaving = true
		failure = ''

		try {
			await updateTrack(track.id, { title, genre, description, visibility, artworkKey })
			props.onClose()
		} catch (saveError) {
			failure = `Couldn't save (${getErrorReason(saveError)}).`
		} finally {
			isSaving = false
		}
	}

	const handleDelete = () => {
		const track = props.track
		if (track) props.onDelete(track)
	}
</script>

<fem-dialog class="studio-dialog isWide" open={isOpen} heading="Edit track" onclose={props.onClose}>
	<fem-column gap="5">
	<div class="edit-track">
		<fem-field label="Artwork" help="Square, 1400 px or more.">
			<fem-file-upload kind="image" accept="image/*" label="Add artwork" src={artworkSource} onchange={handleArtworkChange}></fem-file-upload>
		</fem-field>
		<fem-column gap="4">
			<fem-field label="Title">
				<fem-input value={title} oninput={handleTitleInput}></fem-input>
			</fem-field>
			<fem-field label="Genre">
				<fem-input value={genre} placeholder="Dark pop" oninput={handleGenreInput}></fem-input>
			</fem-field>
		</fem-column>
	</div>
	<fem-field label="Description">
		<fem-textarea autosize maxlength={1000} value={description} oninput={handleDescriptionInput}></fem-textarea>
	</fem-field>
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
