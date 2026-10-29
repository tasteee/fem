<script lang="ts">
	import { studio } from '../data/studio.svelte'
	import GuestTrackMenu from '../owner/GuestTrackMenu.svelte'
	import LoadingPage from '../parts/LoadingPage.svelte'
	import SiteHeader from '../parts/SiteHeader.svelte'
	import { replacePath } from '../routing/router.svelte'

	// Songs you saved from other artists. Each "⋯" can put
	// one in a playlist.
	$effect(() => {
		const isSignedOut = studio.status === 'signed-out' || studio.status === 'no-artist'
		if (isSignedOut) replacePath('/studio')
	})

	const isLoading = $derived(studio.status === 'loading')
	const savedTracks = $derived(studio.savedTracks)
	const hasSavedTracks = $derived(savedTracks.length > 0)
</script>

{#if isLoading}
	<LoadingPage />
{:else}
	<div class="app-page">
		<SiteHeader />
		<div class="studio-toolbar">
			<fem-heading level={1} size="title">Saved</fem-heading>
		</div>
		{#if hasSavedTracks}
			<div class="track-list">
				{#each savedTracks as track (track.id)}
					<fem-track-row {track} queue={savedTracks}>
						<span slot="trailing" class="row-action"><GuestTrackMenu {track} /></span>
					</fem-track-row>
				{/each}
			</div>
		{:else}
			<fem-empty-state heading="No saved songs">
				<fem-icon slot="icon" name="bookmark-simple"></fem-icon>
				Press Save on another artist's song. Then you can add it to your playlists.
			</fem-empty-state>
		{/if}
	</div>
{/if}
