<script lang="ts">
	import { player } from '@tasteee/fem-media'
	import ArtistPage from './pages/ArtistPage.svelte'
	import HomePage from './pages/HomePage.svelte'
	import NotFoundPage from './pages/NotFoundPage.svelte'
	import PlaylistPage from './pages/PlaylistPage.svelte'
	import TrackPage from './pages/TrackPage.svelte'
	import { navigate, router } from './routing/router.svelte'

	// Tapping the player bar opens the playing track's page,
	// which is its big now-playing view.
	const handleExpand = () => {
		const playingTrack = player.getState().track
		const trackPath = playingTrack?.href
		if (!trackPath) return
		navigate(trackPath)
	}
</script>

{#if router.route.kind === 'home'}
	<HomePage />
{:else if router.route.kind === 'artist'}
	<ArtistPage artistSlug={router.route.artistSlug} />
{:else if router.route.kind === 'track'}
	<TrackPage artistSlug={router.route.artistSlug} trackSlug={router.route.trackSlug} />
{:else if router.route.kind === 'playlist'}
	<PlaylistPage artistSlug={router.route.artistSlug} playlistSlug={router.route.playlistSlug} />
{:else}
	<NotFoundPage />
{/if}

<div class="player-dock">
	<fem-player-bar expandable onexpand={handleExpand}></fem-player-bar>
</div>
