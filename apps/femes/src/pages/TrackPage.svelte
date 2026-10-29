<script lang="ts">
	import { getTrackPage } from '../data/catalog'
	import type { TrackPageT } from '../data/types'
	import ArtistChip from '../parts/ArtistChip.svelte'
	import LoadingPage from '../parts/LoadingPage.svelte'
	import SiteHeader from '../parts/SiteHeader.svelte'
	import TrackList from '../parts/TrackList.svelte'
	import { buildArtistPath, buildEmbedTrackPath } from '../routing/routes'
	import SaveButton from '../parts/SaveButton.svelte'
	import NotFoundPage from './NotFoundPage.svelte'

	type TrackPagePropsT = {
		artistSlug: string
		trackSlug: string
	}

	const props: TrackPagePropsT = $props()
	const pageRequest = $derived(getTrackPage(props.artistSlug, props.trackSlug))

	// Play starts this track, then carries on through the
	// artist's other tracks.
	const buildQueue = (page: TrackPageT) => [page.track, ...page.moreTracks]
	const buildShareUrl = () => window.location.href

	// What an artist pastes into their own site.
	const buildEmbedCode = (page: TrackPageT) => {
		const embedPath = buildEmbedTrackPath(page.artist.slug, page.track.slug)
		const embedUrl = `${window.location.origin}${embedPath}`
		const safeTitle = page.track.title.replace(/"/g, '&quot;')
		return `<iframe src="${embedUrl}" width="100%" height="120" style="border:0;border-radius:12px" allow="autoplay" loading="lazy" title="${safeTitle}"></iframe>`
	}

	const buildMoreLabel = (page: TrackPageT) => `More from ${page.artist.name}`
</script>

{#await pageRequest}
	<LoadingPage />
{:then page}
	{#if page}
		{@const hasDescription = page.track.description !== ''}
		{@const hasMore = page.moreTracks.length > 0}
		<div class="app-page">
			<SiteHeader />
			<div class="track-layout">
				<fem-now-playing track={page.track} queue={buildQueue(page)} artistHref={buildArtistPath(page.artist.slug)}></fem-now-playing>
				<aside class="track-side">
					<div class="track-side-head">
						<ArtistChip artist={page.artist} />
						<SaveButton track={page.track} />
					</div>
					{#if hasDescription}
						<fem-text color="muted">{page.track.description}</fem-text>
					{/if}
					<fem-field label="Link">
						<fem-copy-field value={buildShareUrl()} shareable shareTitle={page.track.title}></fem-copy-field>
					</fem-field>
					<fem-field label="Embed" help="Paste into any website.">
						<fem-copy-field label="Embed code" value={buildEmbedCode(page)}></fem-copy-field>
					</fem-field>
					{#if hasMore}
						<fem-column gap="2">
							<span class="section-label">{buildMoreLabel(page)}</span>
							<TrackList tracks={page.moreTracks} />
						</fem-column>
					{/if}
				</aside>
			</div>
		</div>
	{:else}
		<NotFoundPage />
	{/if}
{/await}
