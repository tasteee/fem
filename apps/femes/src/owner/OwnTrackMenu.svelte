<script lang="ts">
	import type { FemesTrackT } from '../data/types'
	import { openAddToPlaylist, openDeleteTrack, openEditTrack } from './owner-dialogs.svelte'
	import { shareLink } from './share-link'

	type OwnTrackMenuPropsT = {
		track: FemesTrackT
	}

	// The "⋯" on the artist's own tracks.
	const props: OwnTrackMenuPropsT = $props()

	const handleEdit = () => openEditTrack(props.track)
	const handleAddToPlaylist = () => openAddToPlaylist(props.track)
	const handleShare = () => shareLink(props.track.href ?? '', props.track.title)
	const handleDelete = () => openDeleteTrack(props.track)
	const menuLabel = $derived(`Actions for ${props.track.title}`)
</script>

<fem-menu>
	<fem-button slot="trigger" kind="ghost" shape="circle" size="small" label={menuLabel}>
		<fem-icon name="dots-three"></fem-icon>
	</fem-button>
	<fem-menu-item onclick={handleEdit}>Edit details</fem-menu-item>
	<fem-menu-item onclick={handleAddToPlaylist}>Add to playlist</fem-menu-item>
	<fem-menu-item onclick={handleShare}>Share</fem-menu-item>
	<fem-menu-item color="danger" onclick={handleDelete}>Delete</fem-menu-item>
</fem-menu>
