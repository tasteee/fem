<script lang="ts">
	import { studio } from '../data/studio.svelte'
	import { getLibrary } from '../data/studio-api'
	import type { LibraryT } from '../data/studio-api'
	import type { ArtistT } from '../data/types'
	import FollowButton from '../parts/FollowButton.svelte'
	import LoadingPage from '../parts/LoadingPage.svelte'
	import { readValue } from '../parts/read-value'
	import SaveButton from '../parts/SaveButton.svelte'
	import SiteHeader from '../parts/SiteHeader.svelte'
	import { navigate, replacePath } from '../routing/router.svelte'
	import { buildArtistPath } from '../routing/routes'

	type FollowingTabT = 'new' | 'artists'

	// New songs from artists you follow, and who they are.
	// Only you see this.
	let selectedTab = $state<FollowingTabT>('new')
	let library = $state<LibraryT | undefined>(undefined)
	let hasFailed = $state(false)
	let hasRequested = false

	const loadLibrary = async () => {
		try {
			library = await getLibrary()
		} catch (libraryError) {
			console.error('femes: following failed to load', libraryError)
			hasFailed = true
		}
	}

	$effect(() => {
		const isSignedOut = studio.status === 'signed-out' || studio.status === 'no-artist'
		if (isSignedOut) replacePath('/studio')
		const isReady = studio.status === 'ready'
		const shouldLoad = isReady && !hasRequested
		if (!shouldLoad) return
		hasRequested = true
		loadLibrary()
	})

	const isLoading = $derived(library === undefined && !hasFailed)
	const freshTracks = $derived(library?.freshTracks ?? [])
	const following = $derived(library?.following ?? [])
	const isNewTab = $derived(selectedTab === 'new')
	const hasFreshTracks = $derived(freshTracks.length > 0)
	const hasFollowing = $derived(following.length > 0)

	const handleTabChange = (event: Event) => {
		selectedTab = readValue(event) as FollowingTabT
	}

	const openArtist = (artist: ArtistT) => navigate(buildArtistPath(artist.slug))
	const describeArtist = (artist: ArtistT) => `/${artist.slug}`
	const handleRetry = () => window.location.reload()
</script>

{#if isLoading}
	<LoadingPage />
{:else}
	<div class="app-page">
		<SiteHeader />
		<div class="studio-toolbar">
			<fem-heading level={1} size="title">Following</fem-heading>
			<span class="studio-toolbar-spacer"></span>
			<fem-segmented value={selectedTab} onchange={handleTabChange}>
				<fem-segment value="new">New songs</fem-segment>
				<fem-segment value="artists">Artists</fem-segment>
			</fem-segmented>
		</div>

		{#if hasFailed}
			<fem-empty-state heading="Couldn't load this">
				Check your connection and try again.
				<fem-button slot="actions" kind="soft" onclick={handleRetry}>Try again</fem-button>
			</fem-empty-state>
		{:else if isNewTab}
			{#if hasFreshTracks}
				<div class="track-list">
					{#each freshTracks as track (track.id)}
						<fem-track-row {track} queue={freshTracks}>
							<span slot="trailing" class="row-action"><SaveButton {track} /></span>
						</fem-track-row>
					{/each}
				</div>
			{:else}
				<fem-empty-state heading="Nothing new yet">
					<fem-icon slot="icon" name="music-notes"></fem-icon>
					Follow artists from their pages. Their new songs show up here.
				</fem-empty-state>
			{/if}
		{:else if hasFollowing}
			<div class="track-list">
				{#each following as artist (artist.id)}
					<fem-list-item interactive label={artist.name} description={describeArtist(artist)} onselect={() => openArtist(artist)}>
						<fem-avatar slot="leading" size="small" name={artist.name} src={artist.avatarUrl}></fem-avatar>
						<span slot="trailing" class="row-action"><FollowButton {artist} /></span>
					</fem-list-item>
				{/each}
			</div>
		{:else}
			<fem-empty-state heading="Not following anyone">
				<fem-icon slot="icon" name="user-plus"></fem-icon>
				Press Follow on an artist's page. Only you see who you follow.
			</fem-empty-state>
		{/if}
	</div>
{/if}
