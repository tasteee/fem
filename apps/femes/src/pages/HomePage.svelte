<script lang="ts">
	import SiteHeader from '../parts/SiteHeader.svelte'
	import { navigate } from '../routing/router.svelte'
	import { buildArtistPath } from '../routing/routes'

	const demoArtistPath = buildArtistPath('tasteink')
	const handleDemoClick = () => navigate(demoArtistPath)
</script>

<div class="app-page">
	<SiteHeader />
	<section class="home-hero">
		<fem-heading level={1} size="display">A quiet place for your music.</fem-heading>
		<fem-text color="muted">Share tracks and playlists with a link. No ads. Listeners never need an account.</fem-text>
		<fem-row gap="2">
			<fem-button onclick={handleDemoClick}>See an artist page</fem-button>
		</fem-row>
	</section>
</div>
