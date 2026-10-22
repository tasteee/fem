<script lang="ts">
	import type { ArtistT } from '../data/types'
	import { buildArtistPath } from '../routing/routes'

	type ArtistChipPropsT = {
		artist: ArtistT
	}

	const props: ArtistChipPropsT = $props()
	const artistPath = $derived(buildArtistPath(props.artist.slug))
</script>

<a class="artist-chip" href={artistPath}>
	<fem-avatar size="small" name={props.artist.name} src={props.artist.avatarUrl}></fem-avatar>
	{props.artist.name}
</a>
