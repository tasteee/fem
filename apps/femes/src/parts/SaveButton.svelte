<script lang="ts">
	import type { FemesTrackT } from '../data/types'
	import { checkIsOwnSlug, checkIsSaved, checkIsSignedInArtist, toggleSave } from '../data/viewer.svelte'

	type SaveButtonPropsT = {
		track: FemesTrackT
	}

	// Only signed-in artists see it, and never on their
	// own songs. No counts, just the artist's own state.
	const props: SaveButtonPropsT = $props()


	const isOwnTrack = $derived(checkIsOwnSlug(props.track.artistSlug))
	const isPublic = $derived(props.track.visibility === 'public')
	const canSave = $derived(checkIsSignedInArtist() && !isOwnTrack && isPublic)
	const isSaved = $derived(checkIsSaved(props.track.id))
	const label = $derived(isSaved ? 'Saved' : 'Save')
	const iconName = $derived(isSaved ? 'check' : 'bookmark-simple')
	const kind = $derived(isSaved ? 'solid' : 'soft')

	const handleClick = () => toggleSave(props.track.id)
</script>

{#if canSave}
	<fem-button {kind} size="small" onclick={handleClick}>
		<fem-icon name={iconName} size="small"></fem-icon>
		{label}
	</fem-button>
{/if}
