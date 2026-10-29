<script lang="ts">
	import { showToast } from '@tasteee/fem'
	import { studio, updateArtist } from '../data/studio.svelte'
	import { getErrorReason } from '../data/studio-api'
	import { readValue } from '../parts/read-value'
	import { buildArtistPath, buildSlug } from '../routing/routes'
	import CroppedImagePicker from './CroppedImagePicker.svelte'

	type EditProfileDialogPropsT = {
		open: boolean
		onClose: () => void
	}

	type LinkRowT = {
		id: string
		label: string
		url: string
	}

	const props: EditProfileDialogPropsT = $props()
	const maxLinks = 6
	let name = $state('')
	let slug = $state('')
	let bio = $state('')
	let links = $state<LinkRowT[]>([])
	let avatarKey = $state<string | undefined>(undefined)
	let headerKey = $state<string | undefined>(undefined)
	let isSaving = $state(false)
	let failure = $state('')

	const toLinkRow = (link: { label: string; url: string }): LinkRowT => ({ id: crypto.randomUUID(), label: link.label, url: link.url })

	// Opening starts the form from the saved profile.
	$effect(() => {
		const artist = studio.artist
		if (!props.open || !artist) return
		name = artist.name
		slug = artist.slug
		bio = artist.bio
		links = artist.links.map(toLinkRow)
		avatarKey = undefined
		headerKey = undefined
		failure = ''
	})

	const avatarSource = $derived(studio.artist?.avatarUrl ?? '')
	const headerSource = $derived(studio.artist?.headerUrl ?? '')
	const publicPath = $derived(buildArtistPath(slug || 'your-name'))
	const linkHelp = $derived(`Your page: ${window.location.host}${publicPath}`)
	const canAddLink = $derived(links.length < maxLinks)
	const hasFailure = $derived(failure !== '')

	const failureMessages: Record<string, string> = {
		'slug-taken': 'That link is taken. Try another.',
		'slug-too-short': 'The link needs at least 2 letters or numbers.'
	}

	const handleNameInput = (event: Event) => {
		name = readValue(event)
	}

	const handleSlugInput = (event: Event) => {
		slug = buildSlug(readValue(event))
	}

	const handleBioInput = (event: Event) => {
		bio = readValue(event)
	}

	const updateLink = (linkId: string, field: 'label' | 'url', event: Event) => {
		const link = links.find((entry) => entry.id === linkId)
		if (link) link[field] = readValue(event)
	}

	const addLink = () => {
		links = [...links, { id: crypto.randomUUID(), label: '', url: 'https://' }]
	}

	const removeLink = (linkId: string) => {
		links = links.filter((link) => link.id !== linkId)
	}

	// Both pictures are cropped before they upload: the
	// avatar round, the header wide.
	let busyImageCount = $state(0)
	const isUploadingImage = $derived(busyImageCount > 0)
	const hasPendingAvatar = $derived(avatarKey !== undefined)
	const hasPendingHeader = $derived(headerKey !== undefined)

	const handleImageBusy = (isBusy: boolean) => {
		const change = isBusy ? 1 : -1
		busyImageCount = Math.max(0, busyImageCount + change)
	}

	const handleImageFailure = (message: string) => showToast(message)
	const handleAvatarUploaded = (key: string) => (avatarKey = key)
	const handleHeaderUploaded = (key: string) => (headerKey = key)

	const handleSave = async () => {
		isSaving = true
		failure = ''
		const savedLinks = links.map((link) => ({ label: link.label, url: link.url }))

		try {
			await updateArtist({ name, slug, bio, links: savedLinks, avatarKey, headerKey })
			props.onClose()
			showToast('Profile saved')
		} catch (saveError) {
			const reason = getErrorReason(saveError)
			failure = failureMessages[reason] ?? `Couldn't save (${reason}).`
		} finally {
			isSaving = false
		}
	}
</script>

<fem-dialog class="studio-dialog isWide" open={props.open} heading="Edit profile" onclose={props.onClose}>
	<div class="profile-editor">
		<fem-field label="Header" help="A wide image, at least 1600 × 400.">
			<CroppedImagePicker
				label="Add a header"
				cropHeading="Crop header"
				src={headerSource}
				aspect={4}
				ratio="4 / 1"
				shape="square"
				outputWidth={2400}
				hasPending={hasPendingHeader}
				onUploaded={handleHeaderUploaded}
				onBusyChange={handleImageBusy}
				onFailure={handleImageFailure}
			/>
		</fem-field>
		<fem-field label="Avatar">
			<CroppedImagePicker
				class="profile-avatar-upload"
				label="Add"
				cropHeading="Crop avatar"
				src={avatarSource}
				aspect={1}
				shape="round"
				outputWidth={800}
				hasPending={hasPendingAvatar}
				onUploaded={handleAvatarUploaded}
				onBusyChange={handleImageBusy}
				onFailure={handleImageFailure}
			/>
		</fem-field>
		<div class="profile-editor-pair">
			<fem-field label="Artist name">
				<fem-input value={name} oninput={handleNameInput}></fem-input>
			</fem-field>
			<fem-field label="Link" help={linkHelp}>
				<fem-input value={slug} oninput={handleSlugInput}></fem-input>
			</fem-field>
		</div>
		<fem-field label="Bio">
			<fem-textarea autosize maxlength={160} value={bio} placeholder="A line or two about your music." oninput={handleBioInput}></fem-textarea>
		</fem-field>
		<fem-field label="Links">
			<fem-column gap="2">
				{#each links as link (link.id)}
					<div class="profile-link-row">
						<fem-input value={link.label} placeholder="Instagram" label="Link name" oninput={(event: Event) => updateLink(link.id, 'label', event)}></fem-input>
						<fem-input value={link.url} type="url" label="Link address" oninput={(event: Event) => updateLink(link.id, 'url', event)}></fem-input>
						<fem-button kind="ghost" shape="circle" size="small" label="Remove link" onclick={() => removeLink(link.id)}>
							<fem-icon name="x"></fem-icon>
						</fem-button>
					</div>
				{/each}
				{#if canAddLink}
					<fem-row>
						<fem-button size="small" kind="soft" onclick={addLink}>
							<fem-icon name="plus"></fem-icon>
							Add link
						</fem-button>
					</fem-row>
				{/if}
			</fem-column>
		</fem-field>
		{#if hasFailure}
			<fem-text size="small" color="danger">{failure}</fem-text>
		{/if}
	</div>
	<fem-button slot="actions" kind="soft" onclick={props.onClose}>Cancel</fem-button>
	<fem-button slot="actions" loading={isSaving} disabled={isUploadingImage} onclick={handleSave}>Save</fem-button>
</fem-dialog>
