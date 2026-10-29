<script lang="ts">
	import { player } from '@tasteee/fem-media'
	import ArtistPage from './pages/ArtistPage.svelte'
	import EmbedTrackPage from './pages/EmbedTrackPage.svelte'
	import HomePage from './pages/HomePage.svelte'
	import NotFoundPage from './pages/NotFoundPage.svelte'
	import PlaylistPage from './pages/PlaylistPage.svelte'
	import SignInPage from './pages/SignInPage.svelte'
	import StudioPlaylistsPage from './pages/studio/StudioPlaylistsPage.svelte'
	import StudioProfilePage from './pages/studio/StudioProfilePage.svelte'
	import StudioTracksPage from './pages/studio/StudioTracksPage.svelte'
	import TrackPage from './pages/TrackPage.svelte'
	import { navigate, router } from './routing/router.svelte'

	// An embed is a bare player inside someone's page, so
	// it gets no player bar of its own.
	const isEmbed = $derived(router.route.kind === 'embed-track')

	$effect(() => {
		document.documentElement.toggleAttribute('data-embed', isEmbed)
	})

	// Tapping the player bar opens the playing track's page,
	// which is its big now-playing view.
	const handleExpand = () => {
		const playingTrack = player.getState().track
		const trackPath = playingTrack?.href
		if (!trackPath) return
		navigate(trackPath)
	}
</script>

{#if router.route.kind === 'embed-track'}
	<EmbedTrackPage artistSlug={router.route.artistSlug} trackSlug={router.route.trackSlug} />
{:else if router.route.kind === 'home'}
	<HomePage />
{:else if router.route.kind === 'artist'}
	<ArtistPage artistSlug={router.route.artistSlug} />
{:else if router.route.kind === 'track'}
	<TrackPage artistSlug={router.route.artistSlug} trackSlug={router.route.trackSlug} />
{:else if router.route.kind === 'playlist'}
	<PlaylistPage artistSlug={router.route.artistSlug} playlistSlug={router.route.playlistSlug} />
{:else if router.route.kind === 'signin'}
	<SignInPage />
{:else if router.route.kind === 'studio-tracks'}
	<StudioTracksPage />
{:else if router.route.kind === 'studio-playlists'}
	<StudioPlaylistsPage playlistId={router.route.playlistId} />
{:else if router.route.kind === 'studio-profile'}
	<StudioProfilePage />
{:else}
	<NotFoundPage />
{/if}

{#if !isEmbed}
	<div class="player-dock">
		<fem-player-bar expandable onexpand={handleExpand}></fem-player-bar>
	</div>
{/if}
