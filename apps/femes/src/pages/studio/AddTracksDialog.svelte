<script lang="ts">
	import { listPickableGuestTracks, studio } from '../../data/studio.svelte'
	import type { FemesTrackT } from '../../data/types'

	type AddTracksDialogPropsT = {
		open: boolean
		chosenIds: string[]
		onSave: (trackIds: string[]) => void
		onClose: () => void
	}

	const props: AddTracksDialogPropsT = $props()
	let picked = $state<string[]>([])

	// Opening starts from the playlist's current tracks.
	$effect(() => {
		if (props.open) picked = [...props.chosenIds]
	})

	// Other artists' songs come from Save. Each keeps its
	// artist's name so the credit is always clear.
	const guestTracks = $derived(listPickableGuestTracks())
	const hasOwnTracks = $derived(studio.tracks.length > 0)
	const hasGuestTracks = $derived(guestTracks.length > 0)
	const hasAnyTracks = $derived(hasOwnTracks || hasGuestTracks)
	const pickedCount = $derived(picked.length)
	const saveLabel = $derived(`Save · ${pickedCount}`)

	const checkIsPicked = (track: FemesTrackT) => picked.includes(track.id)

	// New picks go to the end; the playlist keeps its order.
	const togglePick = (track: FemesTrackT) => {
		const isPicked = checkIsPicked(track)
		const withoutTrack = picked.filter((id) => id !== track.id)
		const withTrack = [...picked, track.id]
		picked = isPicked ? withoutTrack : withTrack
	}

	const handleSave = () => props.onSave(picked)
</script>

<fem-dialog class="studio-dialog" open={props.open} heading="Tracks in this playlist" onclose={props.onClose}>
	{#if hasAnyTracks}
		<div class="pick-groups">
			{#if hasOwnTracks}
				<div class="pick-list">
					<span class="section-label">Your tracks</span>
					{#each studio.tracks as track (track.id)}
						<fem-checkbox checked={checkIsPicked(track)} onchange={() => togglePick(track)}>{track.title}</fem-checkbox>
					{/each}
				</div>
			{/if}
			{#if hasGuestTracks}
				<div class="pick-list">
					<span class="section-label">Saved</span>
					{#each guestTracks as track (track.id)}
						<fem-checkbox checked={checkIsPicked(track)} onchange={() => togglePick(track)}>
							{track.title}
							<span class="pick-artist">{track.artist}</span>
						</fem-checkbox>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<fem-text color="muted">Upload a track or save another artist's song, then add it here.</fem-text>
	{/if}
	<fem-button slot="actions" kind="soft" onclick={props.onClose}>Cancel</fem-button>
	<fem-button slot="actions" onclick={handleSave}>{saveLabel}</fem-button>
</fem-dialog>
