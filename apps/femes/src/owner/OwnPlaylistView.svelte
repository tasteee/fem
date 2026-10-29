<script lang="ts">
	import { showToast } from '@tasteee/fem'
	import { formatDuration } from '@tasteee/fem/foundation'
	import { listPlaylistTracks, setPlaylistTracks } from '../data/studio.svelte'
	import { getErrorReason } from '../data/studio-api'
	import type { ArtistT, FemesTrackT, PlaylistT } from '../data/types'
	import ArtistChip from '../parts/ArtistChip.svelte'
	import { formatTrackCount } from '../parts/format-count'
	import SiteHeader from '../parts/SiteHeader.svelte'
	import { buildPlaylistPath } from '../routing/routes'
	import { openDeletePlaylist, openEditPlaylist, openFillPlaylist } from './owner-dialogs.svelte'
	import { shareLink } from './share-link'
	import VisibilityBadge from './VisibilityBadge.svelte'

	type OwnPlaylistViewPropsT = {
		artist: ArtistT
		playlist: PlaylistT
	}

	type ReorderDetailT = { from: number; to: number }

	// The artist's own playlist: edit it, add songs, drag
	// to reorder, remove with the ×.
	const props: OwnPlaylistViewPropsT = $props()

	const tracks = $derived(listPlaylistTracks(props.playlist))
	const hasTracks = $derived(tracks.length > 0)
	const hasDescription = $derived(props.playlist.description !== '')
	const playlistPath = $derived(buildPlaylistPath(props.artist.slug, props.playlist.slug))

	const summary = $derived.by(() => {
		const durations = tracks.map((track) => track.duration ?? 0)
		const totalSeconds = durations.reduce((sum, seconds) => sum + seconds, 0)
		return `${formatTrackCount(tracks.length)} · ${formatDuration(totalSeconds)}`
	})

	const saveTrackIds = async (trackIds: string[]) => {
		try {
			await setPlaylistTracks(props.playlist.id, trackIds)
		} catch (saveError) {
			showToast(`Couldn't update tracks (${getErrorReason(saveError)}).`)
		}
	}

	const handleReorder = (event: Event) => {
		const detail = (event as CustomEvent<ReorderDetailT>).detail
		const ids = tracks.map((track) => track.id)
		const moved = ids.splice(detail.from, 1)
		ids.splice(detail.to, 0, ...moved)
		saveTrackIds(ids)
	}

	const removeTrack = (track: FemesTrackT) => {
		const ids = tracks.map((entry) => entry.id)
		const remaining = ids.filter((id) => id !== track.id)
		saveTrackIds(remaining)
	}

	const handleEdit = () => openEditPlaylist(props.playlist)
	const handleFill = () => openFillPlaylist(props.playlist)
	const handleDelete = () => openDeletePlaylist(props.playlist)
	const handleShare = () => shareLink(playlistPath, props.playlist.name)
	const buildRemoveLabel = (track: FemesTrackT) => `Remove ${track.title}`
</script>

<div class="app-page">
	<SiteHeader />
	<div class="playlist-head">
		<fem-image class="playlist-cover" src={props.playlist.coverUrl} alt="" radius="container" eager></fem-image>
		<div class="playlist-titles">
			<span class="section-label">Playlist</span>
			<fem-heading level={1} size="title">{props.playlist.name}</fem-heading>
			<ArtistChip artist={props.artist} />
			<span class="playlist-tile-meta">
				<span class="numeric muted">{summary}</span>
				<VisibilityBadge visibility={props.playlist.visibility} />
			</span>
		</div>
	</div>
	{#if hasDescription}
		<fem-text color="muted">{props.playlist.description}</fem-text>
	{/if}
	<div class="manage-row">
		<fem-play-button queue={tracks}></fem-play-button>
		<fem-button kind="soft" onclick={handleEdit}>Edit</fem-button>
		<fem-button kind="soft" onclick={handleFill}>
			<fem-icon name="plus"></fem-icon>
			Add songs
		</fem-button>
		<fem-button kind="soft" shape="circle" label="Share" onclick={handleShare}>
			<fem-icon name="share-fat"></fem-icon>
		</fem-button>
		<fem-menu>
			<fem-button slot="trigger" kind="ghost" shape="circle" label="More">
				<fem-icon name="dots-three"></fem-icon>
			</fem-button>
			<fem-menu-item color="danger" onclick={handleDelete}>Delete playlist</fem-menu-item>
		</fem-menu>
	</div>
	{#if hasTracks}
		<fem-sortable class="track-list" label="Playlist order" gap="0" onreorder={handleReorder}>
			{#each tracks as track (track.id)}
				<fem-track-row {track} queue={tracks}>
					<span slot="trailing" class="row-action">
						<fem-button kind="ghost" shape="circle" size="small" label={buildRemoveLabel(track)} onclick={() => removeTrack(track)}>
							<fem-icon name="x"></fem-icon>
						</fem-button>
					</span>
				</fem-track-row>
			{/each}
		</fem-sortable>
		<fem-text size="small" color="muted">Drag to reorder.</fem-text>
	{:else}
		<fem-card class="studio-empty">
			<fem-empty-state heading="An empty playlist">
				<fem-icon slot="icon" name="list"></fem-icon>
				Add your tracks, or songs you saved from other artists.
				<fem-button slot="actions" onclick={handleFill}>Add songs</fem-button>
			</fem-empty-state>
		</fem-card>
	{/if}
</div>
