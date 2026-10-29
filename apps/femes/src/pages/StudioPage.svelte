<script lang="ts">
	import { studio } from '../data/studio.svelte'
	import LoadingPage from '../parts/LoadingPage.svelte'
	import SiteHeader from '../parts/SiteHeader.svelte'
	import { replacePath } from '../routing/router.svelte'
	import { buildArtistPath } from '../routing/routes'
	import Onboarding from './Onboarding.svelte'

	// Where sign-in lands. Signed out goes to sign in. A
	// new artist picks a name. Everyone else goes to their
	// own page, where they manage everything.
	$effect(() => {
		const isSignedOut = studio.status === 'signed-out'
		if (isSignedOut) replacePath('/signin')
		const artist = studio.artist
		const isReady = studio.status === 'ready' && artist !== null
		if (isReady) replacePath(buildArtistPath(artist.slug))
	})

	const needsArtist = $derived(studio.status === 'no-artist')
	const hasFailed = $derived(studio.status === 'failed')
	const handleRetry = () => window.location.reload()
</script>

{#if needsArtist}
	<div class="app-page">
		<SiteHeader />
		<Onboarding />
	</div>
{:else if hasFailed}
	<div class="app-page">
		<SiteHeader />
		<fem-empty-state heading="Couldn't load your page">
			Check your connection and try again.
			<fem-button slot="actions" kind="soft" onclick={handleRetry}>Try again</fem-button>
		</fem-empty-state>
	</div>
{:else}
	<LoadingPage />
{/if}
