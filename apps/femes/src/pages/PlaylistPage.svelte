<script lang="ts">
	import { formatDuration } from '@tasteee/fem/foundation'
	import { getPlaylistPage } from '../data/catalog'
	import { sharePage } from '../data/share-page'
	import type { PlaylistPageT } from '../data/types'
	import ArtistChip from '../parts/ArtistChip.svelte'
	import LoadingPage from '../parts/LoadingPage.svelte'
	import SiteHeader from '../parts/SiteHeader.svelte'
	import { formatTrackCount } from '../parts/format-count'
	import TrackList from '../parts/TrackList.svelte'
	import NotFoundPage from './NotFoundPage.svelte'

	type PlaylistPagePropsT = {
		artistSlug: string
		playlistSlug: string
	}

	const props: PlaylistPagePropsT = $props()
	const pageRequest = $derived(getPlaylistPage(props.artistSlug, props.playlistSlug))

	const buildSummary = (page: PlaylistPageT): string => {
		const durations = page.tracks.map((track) => track.duration ?? 0)
		const totalSeconds = durations.reduce((sum, seconds) => sum + seconds, 0)
		return `${formatTrackCount(page.tracks.length)} · ${formatDuration(totalSeconds)}`
	}

	const handleShare = () => sharePage(props.playlistSlug)
</script>

{#await pageRequest}
	<LoadingPage />
{:then page}
	{#if page}
		{@const hasDescription = page.playlist.description !== ''}
		<div class="app-page">
			<SiteHeader />
			<div class="playlist-head">
				<fem-image class="playlist-cover" src={page.playlist.coverUrl} alt="" radius="container" eager></fem-image>
				<div class="playlist-titles">
					<span class="section-label">Playlist</span>
					<fem-heading level={1} size="title">{page.playlist.name}</fem-heading>
					<ArtistChip artist={page.artist} />
					<span class="numeric muted">{buildSummary(page)}</span>
				</div>
			</div>
			{#if hasDescription}
				<fem-text color="muted">{page.playlist.description}</fem-text>
			{/if}
			<fem-row gap="3" align-y="center">
				<fem-play-button queue={page.tracks}></fem-play-button>
				<fem-button kind="soft" shape="circle" label="Share" onclick={handleShare}>
					<fem-icon name="share-fat"></fem-icon>
				</fem-button>
			</fem-row>
			<TrackList tracks={page.tracks} />
		</div>
	{:else}
		<NotFoundPage />
	{/if}
{/await}
