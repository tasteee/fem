<script lang="ts">
	import type { FemesTrackT } from '../data/types'

	type TrackListPropsT = {
		tracks: FemesTrackT[]
	}

	// Every row plays the whole list from its own spot.
	const props: TrackListPropsT = $props()
</script>

<div class="track-list">
	{#each props.tracks as track (track.id)}
		<fem-track-row {track} queue={props.tracks}></fem-track-row>
	{/each}
</div>
