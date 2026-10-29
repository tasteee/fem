<script lang="ts">
	import { player } from '@tasteee/fem-media'
	import type { PlayerStateT } from '@tasteee/fem-media'
	import { getTrackPage } from '../data/catalog'
	import type { TrackPageT } from '../data/types'

	type EmbedTrackPagePropsT = {
		artistSlug: string
		trackSlug: string
	}

	// The player other sites put in an iframe. One track,
	// its art, play, and seek. Everything else opens femes.
	const props: EmbedTrackPagePropsT = $props()
	const pageRequest = $derived(getTrackPage(props.artistSlug, props.trackSlug))

	let currentTime = $state(0)
	let duration = $state(0)
	let isCurrent = $state(false)

	const applyState = (state: PlayerStateT) => {
		currentTime = state.currentTime
		duration = state.duration
		isCurrent = state.track !== undefined
	}

	$effect(() => player.subscribe(applyState))

	const buildTrackUrl = (page: TrackPageT) => `${window.location.origin}${page.track.href}`
	const shownTime = $derived(isCurrent ? currentTime : 0)

	// Before play, the stored length shows. After, the
	// audio's own.
	const getShownDuration = (page: TrackPageT) => {
		const storedDuration = page.track.duration ?? 0
		if (isCurrent) return duration
		return storedDuration
	}

	const handleSeek = (event: Event) => {
		if (!isCurrent) return
		const detail = (event as CustomEvent<{ value: number }>).detail
		player.seek(detail.value)
	}
</script>

{#await pageRequest then page}
	{#if page}
		<div class="embed">
			<fem-image class="embed-art" src={page.track.artwork} alt="" radius="inset" eager></fem-image>
			<div class="embed-body">
				<div class="embed-head">
					<div class="embed-titles">
						<a class="embed-title" href={buildTrackUrl(page)} target="_blank" rel="noopener">{page.track.title}</a>
						<span class="embed-artist">{page.artist.name}</span>
					</div>
					<a class="embed-brand" href={buildTrackUrl(page)} target="_blank" rel="noopener">femes</a>
				</div>
				<div class="embed-controls">
					<fem-play-button track={page.track} size="medium"></fem-play-button>
					<fem-scrubber class="embed-scrubber" time="sides" value={shownTime} max={getShownDuration(page)} disabled={!isCurrent} onchange={handleSeek}></fem-scrubber>
				</div>
			</div>
		</div>
	{:else}
		<div class="embed embed-missing">
			<span class="embed-artist">This track isn't available.</span>
		</div>
	{/if}
{/await}
