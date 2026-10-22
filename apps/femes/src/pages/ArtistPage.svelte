<script lang="ts">
	import { getArtistPage } from '../data/catalog'
	import { sharePage } from '../data/share-page'
	import type { ArtistPageT, PlaylistT } from '../data/types'
	import LoadingPage from '../parts/LoadingPage.svelte'
	import SiteHeader from '../parts/SiteHeader.svelte'
	import TrackList from '../parts/TrackList.svelte'
	import { buildPlaylistPath } from '../routing/routes'
	import NotFoundPage from './NotFoundPage.svelte'

	type ArtistPagePropsT = {
		artistSlug: string
	}

	type TabT = 'tracks' | 'playlists'

	const props: ArtistPagePropsT = $props()
	const pageRequest = $derived(getArtistPage(props.artistSlug))
	let selectedTab = $state<TabT>('tracks')

	const handleTabChange = (event: Event) => {
		const segmented = event.currentTarget as HTMLElement & { value: TabT }
		selectedTab = segmented.value
	}

	const handleShare = () => sharePage(props.artistSlug)

	const getPlaylistPath = (playlist: PlaylistT): string => buildPlaylistPath(playlist.artistSlug, playlist.slug)
	const getTrackCountLabel = (page: ArtistPageT): string => `${page.tracks.length} tracks`
</script>

{#await pageRequest}
	<LoadingPage />
{:then page}
	{#if page}
		{@const isTracksTab = selectedTab === 'tracks'}
		{@const hasPlaylists = page.playlists.length > 0}
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
					</div>
				</div>
				<div class="profile-body">
					<fem-row align-y="center" align-x="between">
						{#if hasPlaylists}
							<fem-segmented value={selectedTab} onchange={handleTabChange}>
								<fem-segment value="tracks">Tracks</fem-segment>
								<fem-segment value="playlists">Playlists</fem-segment>
							</fem-segmented>
						{:else}
							<span class="section-label">Tracks</span>
						{/if}
						<span class="numeric muted">{getTrackCountLabel(page)}</span>
					</fem-row>
					{#if isTracksTab}
						<TrackList tracks={page.tracks} />
					{:else}
						<div class="playlist-grid">
							{#each page.playlists as playlist (playlist.id)}
								<a class="playlist-tile" href={getPlaylistPath(playlist)}>
									<fem-image src={playlist.coverUrl} alt="" radius="container"></fem-image>
									<span class="playlist-tile-name">{playlist.name}</span>
									<span class="numeric muted">{playlist.trackIds.length} tracks</span>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<NotFoundPage />
	{/if}
{/await}
