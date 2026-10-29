<script lang="ts">
	import type { FemesTrackT } from '../data/types'
	import { toggleSave } from '../data/viewer.svelte'
	import { navigate } from '../routing/router.svelte'
	import { buildArtistPath } from '../routing/routes'
	import { openAddToPlaylist } from './owner-dialogs.svelte'
	import { shareLink } from './share-link'

	type GuestTrackMenuPropsT = {
		track: FemesTrackT
	}

	// The "⋯" on another artist's saved song.
	const props: GuestTrackMenuPropsT = $props()

	const artistLabel = $derived(`Go to ${props.track.artist}`)
	const menuLabel = $derived(`Actions for ${props.track.title}`)
	const handleAddToPlaylist = () => openAddToPlaylist(props.track)
	const handleShare = () => shareLink(props.track.href ?? '', props.track.title)
	const handleArtist = () => navigate(buildArtistPath(props.track.artistSlug))
	const handleUnsave = () => toggleSave(props.track.id)
</script>

<fem-menu>
	<fem-button slot="trigger" kind="ghost" shape="circle" size="small" label={menuLabel}>
		<fem-icon name="dots-three"></fem-icon>
	</fem-button>
	<fem-menu-item onclick={handleAddToPlaylist}>Add to playlist</fem-menu-item>
	<fem-menu-item onclick={handleShare}>Share</fem-menu-item>
	<fem-menu-item onclick={handleArtist}>{artistLabel}</fem-menu-item>
	<fem-menu-item onclick={handleUnsave}>Remove from saved</fem-menu-item>
</fem-menu>
