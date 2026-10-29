<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { PlaylistT, VisibilityT } from '../data/types'
	import { buildPlaylistPath } from '../routing/routes'
	import { formatTrackCount } from './format-count'

	type PlaylistShelfPropsT = {
		artistName: string
		playlists: PlaylistT[]
		// Owners see which playlists are hidden.
		showVisibility?: boolean
		// The owner's "New playlist" tile.
		newTile?: Snippet
	}

	// An artist's playlists in two quiet groups: their own
	// music, then their picks with other artists' songs.
	// One group alone shows without a heading.
	const props: PlaylistShelfPropsT = $props()

	const visibilityLabels: Record<VisibilityT, string> = {
		public: '',
		unlisted: 'Unlisted',
		private: 'Private'
	}

	const ownPlaylists = $derived(props.playlists.filter((playlist) => !playlist.hasGuests))
	const pickPlaylists = $derived(props.playlists.filter((playlist) => playlist.hasGuests))
	const hasNewTile = $derived(props.newTile !== undefined)
	const hasOwn = $derived(ownPlaylists.length > 0 || hasNewTile)
	const hasPicks = $derived(pickPlaylists.length > 0)
	const shouldLabelGroups = $derived(hasPicks && ownPlaylists.length > 0)
	const ownHeading = $derived(`By ${props.artistName}`)

	const getPath = (playlist: PlaylistT) => buildPlaylistPath(playlist.artistSlug, playlist.slug)

	const getVisibilityLabel = (playlist: PlaylistT): string => {
		if (!props.showVisibility) return ''
		return visibilityLabels[playlist.visibility]
	}
</script>

{#snippet tile(playlist: PlaylistT)}
	{@const visibilityLabel = getVisibilityLabel(playlist)}
	{@const hasVisibilityLabel = visibilityLabel !== ''}
	<a class="playlist-tile" href={getPath(playlist)}>
		<fem-image src={playlist.coverUrl} alt="" radius="container"></fem-image>
		<span class="playlist-tile-name">{playlist.name}</span>
		<span class="playlist-tile-meta">
			<span class="numeric muted">{formatTrackCount(playlist.trackIds.length)}</span>
			{#if hasVisibilityLabel}
				<fem-badge>{visibilityLabel}</fem-badge>
			{/if}
		</span>
	</a>
{/snippet}

<div class="playlist-shelf">
	{#if hasOwn}
		<section class="playlist-group">
			{#if shouldLabelGroups}
				<span class="section-label">{ownHeading}</span>
			{/if}
			<div class="playlist-grid">
				{#each ownPlaylists as playlist (playlist.id)}
					{@render tile(playlist)}
				{/each}
				{@render props.newTile?.()}
			</div>
		</section>
	{/if}
	{#if hasPicks}
		<section class="playlist-group">
			<span class="section-label">Picks</span>
			<div class="playlist-grid">
				{#each pickPlaylists as playlist (playlist.id)}
					{@render tile(playlist)}
				{/each}
			</div>
		</section>
	{/if}
</div>
