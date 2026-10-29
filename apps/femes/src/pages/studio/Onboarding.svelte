<script lang="ts">
	import { createArtist } from '../../data/studio.svelte'
	import { getErrorReason } from '../../data/studio-api'
	import { readValue } from '../../parts/read-value'
	import { buildSlug } from '../../routing/routes'

	let name = $state('')
	let slug = $state('')
	let hasEditedSlug = $state(false)
	let isSaving = $state(false)
	let failureReason = $state('')

	// The link follows the name until it's edited by hand.
	const shownSlug = $derived(hasEditedSlug ? slug : buildSlug(name))
	const hasFailure = $derived(failureReason !== '')

	const failureMessages: Record<string, string> = {
		'slug-taken': 'That link is taken. Try another.',
		'slug-too-short': 'The link needs at least 2 letters or numbers.',
		'name-required': 'Add your artist name.'
	}

	const failureMessage = $derived(failureMessages[failureReason] ?? 'Something went wrong. Try again.')
	const slugPreview = $derived(shownSlug || 'your-name')
	const slugHelp = $derived(`Your page: /${slugPreview}`)

	const handleNameInput = (event: Event) => {
		name = readValue(event)
	}

	const handleSlugInput = (event: Event) => {
		hasEditedSlug = true
		slug = buildSlug(readValue(event))
	}

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault()
		isSaving = true
		failureReason = ''

		try {
			await createArtist(name, shownSlug)
		} catch (createError) {
			failureReason = getErrorReason(createError)
		} finally {
			isSaving = false
		}
	}
</script>

<section class="signin">
	<fem-heading level={1} size="title">Set up your page</fem-heading>
	<fem-text color="muted">Pick the name listeners see and the link you'll share.</fem-text>
	<form class="signin-form" onsubmit={handleSubmit}>
		<fem-field label="Artist name">
			<fem-input required placeholder="tasteink" value={name} oninput={handleNameInput}></fem-input>
		</fem-field>
		<fem-field label="Your link" help={slugHelp}>
			<fem-input required value={shownSlug} oninput={handleSlugInput}></fem-input>
		</fem-field>
		{#if hasFailure}
			<fem-text color="danger" size="small">{failureMessage}</fem-text>
		{/if}
		<fem-button type="submit" size="large" wide loading={isSaving}>Create my page</fem-button>
	</form>
</section>
