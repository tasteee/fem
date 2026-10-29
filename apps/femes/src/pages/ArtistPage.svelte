<script lang="ts">
	import { getArtistPage } from '../data/catalog'
	import { sharePage } from '../data/share-page'
	import type { ArtistPageT } from '../data/types'
	import LoadingPage from '../parts/LoadingPage.svelte'
	import SiteHeader from '../parts/SiteHeader.svelte'
	import FollowButton from '../parts/FollowButton.svelte'
	import { formatPlaylistCount, formatTrackCount } from '../parts/format-count'
	import PlaylistShelf from '../parts/PlaylistShelf.svelte'
	import TrackList from '../parts/TrackList.svelte'
	import { checkIsOwnSlug, studio } from '../data/studio.svelte'
	import OwnArtistView from '../owner/OwnArtistView.svelte'
	import NotFoundPage from './NotFoundPage.svelte'

	type ArtistPagePropsT = {
		artistSlug: string
	}

	type TabT = 'tracks' | 'playlists'

	const props: ArtistPagePropsT = $props()
	// Your own page shows manage controls. Everyone else's
	// is the public page.
	const isCheckingOwner = $derived(studio.status === 'loading')
	const ownArtist = $derived(checkIsOwnSlug(props.artistSlug) ? studio.artist : null)
	const pageRequest = $derived(getArtistPage(props.artistSlug))
	let selectedTab = $state<TabT>('tracks')

	const handleTabChange = (event: Event) => {
		const segmented = event.currentTarget as HTMLElement & { value: TabT }
		selectedTab = segmented.value
	}

	const handleShare = () => sharePage(props.artistSlug)

	const getCountLabel = (page: ArtistPageT): string => {
		const isTracks = selectedTab === 'tracks'
		if (isTracks) return formatTrackCount(page.tracks.length)
		return formatPlaylistCount(page.playlists.length)
	}
</script>

{#if isCheckingOwner}
	<LoadingPage />
{:else if ownArtist}
	<OwnArtistView artist={ownArtist} />
{:else}
{#await pageRequest}
	<LoadingPage />
{:then page}
	{#if page}
		{@const isTracksTab = selectedTab === 'tracks'}
		{@const hasPlaylists = page.playlists.length > 0}
		{@const hasTracks = page.tracks.length > 0}
		<div class="app-page">
			<SiteHeader />
			<div class="profile-header">
				<fem-image src={page.artist.headerUrl} alt="" ratio="4 / 1" radius="container" eager></fem-image>
			</div>
			<div class="profile-layout">
				<div class="profile-intro">
					<span class="profile-avatar-ring">
						<fem-avatar size="large" name={page.artist.name} src={page.artist.avatarUrl}></fem-avatar>
					</span>
					<fem-heading level={1} size="display">{page.artist.name}</fem-heading>
					<fem-text>{page.artist.bio}</fem-text>
					<div class="profile-links">
						{#each page.artist.links as link (link.url)}
							<a class="profile-link" href={link.url} target="_blank" rel="noopener noreferrer">
								<fem-icon name="link" size="small"></fem-icon>
								{link.label}
							</a>
						{/each}
					</div>
					<div class="profile-actions">
						<fem-play-button queue={page.tracks}></fem-play-button>
						<fem-button kind="soft" shape="circle" label="Share" onclick={handleShare}>
							<fem-icon name="share-fat"></fem-icon>
						</fem-button>
						<FollowButton artist={page.artist} />
					</div>
				</div>
				<div class="profile-body">
					<div class="manage-row">
						<fem-segmented value={selectedTab} onchange={handleTabChange}>
							<fem-segment value="tracks">Tracks</fem-segment>
							<fem-segment value="playlists">Playlists</fem-segment>
						</fem-segmented>
						<span class="numeric muted">{getCountLabel(page)}</span>
					</div>
					{#if isTracksTab}
						{#if hasTracks}
							<TrackList tracks={page.tracks} />
						{:else}
							<fem-empty-state heading="No tracks yet">
								<fem-icon slot="icon" name="music-notes"></fem-icon>
								New music from {page.artist.name} shows up here.
							</fem-empty-state>
						{/if}
					{:else if hasPlaylists}
						<PlaylistShelf artistName={page.artist.name} playlists={page.playlists} />
					{:else}
						<fem-empty-state heading="No playlists yet">
							<fem-icon slot="icon" name="list"></fem-icon>
							Playlists from {page.artist.name} show up here.
						</fem-empty-state>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<NotFoundPage />
	{/if}
{/await}
{/if}
