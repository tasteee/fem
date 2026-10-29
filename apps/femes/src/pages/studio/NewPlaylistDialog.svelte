<script lang="ts">
	import { addPlaylist } from '../../data/studio.svelte'
	import { getErrorReason } from '../../data/studio-api'
	import { readValue } from '../../parts/read-value'
	import { navigate } from '../../routing/router.svelte'
	import { buildStudioPlaylistPath } from '../../routing/routes'

	type NewPlaylistDialogPropsT = {
		open: boolean
		onClose: () => void
	}

	const props: NewPlaylistDialogPropsT = $props()
	let name = $state('')
	let isCreating = $state(false)
	let failure = $state('')

	const hasFailure = $derived(failure !== '')
	const hasName = $derived(name.trim() !== '')

	const handleNameInput = (event: Event) => {
		name = readValue(event)
	}

	const handleCreate = async () => {
		isCreating = true
		failure = ''

		try {
			const playlist = await addPlaylist({ name })
			name = ''
			props.onClose()
			navigate(buildStudioPlaylistPath(playlist.id))
		} catch (createError) {
			failure = `Couldn't create it (${getErrorReason(createError)}).`
		} finally {
			isCreating = false
		}
	}
</script>

<fem-dialog open={props.open} heading="New playlist" onclose={props.onClose}>
	<fem-field label="Name">
		<fem-input value={name} placeholder="late night drafts" oninput={handleNameInput}></fem-input>
	</fem-field>
	{#if hasFailure}
		<fem-text size="small" color="danger">{failure}</fem-text>
	{/if}
	<fem-button slot="actions" kind="soft" onclick={props.onClose}>Cancel</fem-button>
	<fem-button slot="actions" loading={isCreating} disabled={!hasName} onclick={handleCreate}>Create</fem-button>
</fem-dialog>
