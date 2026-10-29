<script lang="ts">
	import { studio } from '../data/studio.svelte'
	import type { ArtistT, FemesTrackT } from '../data/types'
	import ArtistChip from '../parts/ArtistChip.svelte'
	import SiteHeader from '../parts/SiteHeader.svelte'
	import TrackList from '../parts/TrackList.svelte'
	import { buildArtistPath, buildEmbedTrackPath } from '../routing/routes'
	import { openEditTrack } from './owner-dialogs.svelte'
	import OwnTrackMenu from './OwnTrackMenu.svelte'
	import VisibilityBadge from './VisibilityBadge.svelte'

	type OwnTrackViewPropsT = {
		artist: ArtistT
		track: FemesTrackT
	}

	// The artist's own track page: the same big player,
	// plus Edit and the track's "⋯". Private tracks open
	// here too, for the owner only.
	const props: OwnTrackViewPropsT = $props()
	const moreTracksCount = 3

	const otherTracks = $derived(studio.tracks.filter((entry) => entry.id !== props.track.id))
	const moreTracks = $derived(otherTracks.slice(0, moreTracksCount))
	const queue = $derived([props.track, ...otherTracks])
	const hasDescription = $derived(props.track.description !== '')
	const hasMore = $derived(moreTracks.length > 0)
	const isPrivate = $derived(props.track.visibility === 'private')
	const shareUrl = $derived(`${window.location.origin}${props.track.href ?? ''}`)
	const artistPath = $derived(buildArtistPath(props.artist.slug))

	const embedCode = $derived.by(() => {
		const embedPath = buildEmbedTrackPath(props.artist.slug, props.track.slug)
		const embedUrl = `${window.location.origin}${embedPath}`
		const safeTitle = props.track.title.replace(/"/g, '&quot;')
		return `<iframe src="${embedUrl}" width="100%" height="120" style="border:0;border-radius:12px" allow="autoplay" loading="lazy" title="${safeTitle}"></iframe>`
	})

	const handleEdit = () => openEditTrack(props.track)
</script>

<div class="app-page">
	<SiteHeader />
	<div class="track-layout">
		<fem-now-playing track={props.track} {queue} artistHref={artistPath}></fem-now-playing>
		<aside class="track-side">
			<div class="track-side-head">
				<ArtistChip artist={props.artist} />
				<div class="track-owner-actions">
					<VisibilityBadge visibility={props.track.visibility} />
					<fem-button kind="soft" size="small" onclick={handleEdit}>Edit</fem-button>
					<OwnTrackMenu track={props.track} />
				</div>
			</div>
			{#if hasDescription}
				<fem-text color="muted">{props.track.description}</fem-text>
			{/if}
			{#if isPrivate}
				<fem-text size="small" color="muted">Private. Only you can open this page. Make it public or unlisted in Edit to share it.</fem-text>
			{:else}
				<fem-field label="Link">
					<fem-copy-field value={shareUrl} shareable shareTitle={props.track.title}></fem-copy-field>
				</fem-field>
				<fem-field label="Embed" help="Paste into any website.">
					<fem-copy-field label="Embed code" value={embedCode}></fem-copy-field>
				</fem-field>
			{/if}
			{#if hasMore}
				<fem-column gap="2">
					<span class="section-label">More of yours</span>
					<TrackList tracks={moreTracks} />
				</fem-column>
			{/if}
		</aside>
	</div>
</div>
