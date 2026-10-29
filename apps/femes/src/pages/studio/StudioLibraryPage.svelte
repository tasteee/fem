<script lang="ts">
	import { getLibrary } from '../../data/studio-api'
	import type { LibraryT } from '../../data/studio-api'
	import { studio } from '../../data/studio.svelte'
	import type { ArtistT } from '../../data/types'
	import FollowButton from '../../parts/FollowButton.svelte'
	import { readValue } from '../../parts/read-value'
	import SaveButton from '../../parts/SaveButton.svelte'
	import { navigate } from '../../routing/router.svelte'
	import { buildArtistPath } from '../../routing/routes'
	import StudioShell from './StudioShell.svelte'

	type LibraryTabT = 'new' | 'saved' | 'following'

	// Other artists' music: new songs from people followed,
	// songs saved for playlists, and who is followed.
	let selectedTab = $state<LibraryTabT>('new')
	let library = $state<LibraryT | undefined>(undefined)
	let hasFailed = $state(false)

	const loadLibrary = async () => {
		try {
			library = await getLibrary()
		} catch (libraryError) {
			console.error('femes: library failed to load', libraryError)
			hasFailed = true
		}
	}

	loadLibrary()

	const isLoading = $derived(library === undefined && !hasFailed)
	const freshTracks = $derived(library?.freshTracks ?? [])
	const following = $derived(library?.following ?? [])
	const savedTracks = $derived(studio.savedTracks)
	const isNewTab = $derived(selectedTab === 'new')
	const isSavedTab = $derived(selectedTab === 'saved')
	const isFollowingTab = $derived(selectedTab === 'following')
	const hasFreshTracks = $derived(freshTracks.length > 0)
	const hasSavedTracks = $derived(savedTracks.length > 0)
	const hasFollowing = $derived(following.length > 0)

	const handleTabChange = (event: Event) => {
		selectedTab = readValue(event) as LibraryTabT
	}

	const openArtist = (artist: ArtistT) => navigate(buildArtistPath(artist.slug))
	const describeArtist = (artist: ArtistT) => `/${artist.slug}`
	const handleRetry = () => window.location.reload()
</script>

<StudioShell section="library">
	<div class="studio-toolbar">
		<fem-heading level={1} size="heading">Library</fem-heading>
		<span class="studio-toolbar-spacer"></span>
		<fem-segmented value={selectedTab} onchange={handleTabChange}>
			<fem-segment value="new">New</fem-segment>
			<fem-segment value="saved">Saved</fem-segment>
			<fem-segment value="following">Following</fem-segment>
		</fem-segmented>
	</div>

	{#if isLoading}
		<div class="studio-center">
			<fem-spinner label="Loading your library"></fem-spinner>
		</div>
	{:else if hasFailed}
		<fem-card class="studio-empty">
			<fem-empty-state heading="Couldn't load your library">
				Check your connection and try again.
				<fem-button slot="actions" kind="soft" onclick={handleRetry}>Try again</fem-button>
			</fem-empty-state>
		</fem-card>
	{:else if isNewTab}
		{#if hasFreshTracks}
			<fem-text size="small" color="muted">The newest songs from artists you follow.</fem-text>
			<fem-card class="studio-list">
				<div class="track-list">
					{#each freshTracks as track (track.id)}
						<fem-track-row {track} queue={freshTracks}>
							<span slot="trailing" class="row-action"><SaveButton {track} /></span>
						</fem-track-row>
					{/each}
				</div>
			</fem-card>
		{:else}
			<fem-card class="studio-empty">
				<fem-empty-state heading="Nothing new yet">
					<fem-icon slot="icon" name="music-notes"></fem-icon>
					Follow artists from their pages. Their new songs show up here.
				</fem-empty-state>
			</fem-card>
		{/if}
	{:else if isSavedTab}
		{#if hasSavedTracks}
			<fem-text size="small" color="muted">Saved songs can go in your playlists.</fem-text>
			<fem-card class="studio-list">
				<div class="track-list">
					{#each savedTracks as track (track.id)}
						<fem-track-row {track} queue={savedTracks}>
							<span slot="trailing" class="row-action"><SaveButton {track} /></span>
						</fem-track-row>
					{/each}
				</div>
			</fem-card>
		{:else}
			<fem-card class="studio-empty">
				<fem-empty-state heading="No saved songs">
					<fem-icon slot="icon" name="bookmark-simple"></fem-icon>
					Press Save on another artist's song. Then you can add it to your playlists.
				</fem-empty-state>
			</fem-card>
		{/if}
	{:else if isFollowingTab}
		{#if hasFollowing}
			<fem-card class="studio-list">
				{#each following as artist (artist.id)}
					<fem-list-item interactive label={artist.name} description={describeArtist(artist)} onselect={() => openArtist(artist)}>
						<fem-avatar slot="leading" size="small" name={artist.name} src={artist.avatarUrl}></fem-avatar>
						<span slot="trailing" class="row-action"><FollowButton {artist} /></span>
					</fem-list-item>
				{/each}
			</fem-card>
		{:else}
			<fem-card class="studio-empty">
				<fem-empty-state heading="Not following anyone">
					<fem-icon slot="icon" name="user-plus"></fem-icon>
					Press Follow on an artist's page. Only you see who you follow.
				</fem-empty-state>
			</fem-card>
		{/if}
	{/if}
</StudioShell>
