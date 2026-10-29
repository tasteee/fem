<script lang="ts">
	import { player } from '@tasteee/fem-media'
	import { ensureStudio, studio } from './data/studio.svelte'
	import OwnerDialogs from './owner/OwnerDialogs.svelte'
	import ArtistPage from './pages/ArtistPage.svelte'
	import EmbedTrackPage from './pages/EmbedTrackPage.svelte'
	import FollowingPage from './pages/FollowingPage.svelte'
	import HomePage from './pages/HomePage.svelte'
	import NotFoundPage from './pages/NotFoundPage.svelte'
	import PlaylistPage from './pages/PlaylistPage.svelte'
	import SavedPage from './pages/SavedPage.svelte'
	import SignInPage from './pages/SignInPage.svelte'
	import StudioPage from './pages/StudioPage.svelte'
	import TrackPage from './pages/TrackPage.svelte'
	import AppTabs from './parts/AppTabs.svelte'
	import { navigate, router } from './routing/router.svelte'

	// An embed is a bare player inside someone's page, so
	// it gets no player bar, tabs, or sign-in check.
	const isEmbed = $derived(router.route.kind === 'embed-track')
	const isSignedInArtist = $derived(studio.status === 'ready')
	const shouldShowTabs = $derived(isSignedInArtist && !isEmbed)

	$effect(() => {
		document.documentElement.toggleAttribute('data-embed', isEmbed)
		document.documentElement.toggleAttribute('data-tabs', shouldShowTabs)
		if (!isEmbed) ensureStudio()
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
{:else if router.route.kind === 'studio'}
	<StudioPage />
{:else if router.route.kind === 'following'}
	<FollowingPage />
{:else if router.route.kind === 'saved'}
	<SavedPage />
{:else}
	<NotFoundPage />
{/if}

{#if !isEmbed}
	<div class="player-dock">
		<fem-player-bar expandable onexpand={handleExpand}></fem-player-bar>
		{#if shouldShowTabs}
			<AppTabs />
		{/if}
	</div>
{/if}

{#if isSignedInArtist}
	<OwnerDialogs />
{/if}
