<script lang="ts">
	import { showToast } from '@tasteee/fem'
	import { setPlaylistTracks, studio } from '../data/studio.svelte'
	import { getErrorReason } from '../data/studio-api'
	import type { FemesTrackT, PlaylistT } from '../data/types'
	import { formatTrackCount } from '../parts/format-count'

	type AddToPlaylistDialogPropsT = {
		track: FemesTrackT | undefined
		onNewPlaylist: (trackId: string) => void
		onClose: () => void
	}

	// Tap a playlist to add the track, tap again to take
	// it out. Each tap saves right away.
	const props: AddToPlaylistDialogPropsT = $props()

	const isOpen = $derived(props.track !== undefined)
	const heading = $derived(`Add “${props.track?.title ?? ''}” to a playlist`)
	const hasPlaylists = $derived(studio.playlists.length > 0)

	const checkHasTrack = (playlist: PlaylistT): boolean => {
		const trackId = props.track?.id ?? ''
		return playlist.trackIds.includes(trackId)
	}

	const describePlaylist = (playlist: PlaylistT): string => {
		const hasTrack = checkHasTrack(playlist)
		if (hasTrack) return 'Added'
		return formatTrackCount(playlist.trackIds.length)
	}

	const togglePlaylist = async (playlist: PlaylistT) => {
		const track = props.track
		if (!track) return
		const hasTrack = checkHasTrack(playlist)
		const withoutTrack = playlist.trackIds.filter((id) => id !== track.id)
		const withTrack = [...playlist.trackIds, track.id]
		const nextIds = hasTrack ? withoutTrack : withTrack

		try {
			await setPlaylistTracks(playlist.id, nextIds)
		} catch (saveError) {
			showToast(`Couldn't update the playlist (${getErrorReason(saveError)}).`)
		}
	}

	const handleNewPlaylist = () => {
		const trackId = props.track?.id ?? ''
		props.onNewPlaylist(trackId)
	}
</script>

<fem-dialog class="studio-dialog" open={isOpen} {heading} onclose={props.onClose}>
	{#if hasPlaylists}
		<div class="pick-groups">
			{#each studio.playlists as playlist (playlist.id)}
				{@const hasTrack = checkHasTrack(playlist)}
				<fem-list-item interactive selected={hasTrack} label={playlist.name} description={describePlaylist(playlist)} onselect={() => togglePlaylist(playlist)}>
					<fem-image slot="leading" class="studio-row-art" src={playlist.coverUrl} alt="" radius="small"></fem-image>
					{#if hasTrack}
						<fem-icon slot="trailing" name="check"></fem-icon>
					{/if}
				</fem-list-item>
			{/each}
		</div>
	{:else}
		<fem-text color="muted">No playlists yet. Start one with this track.</fem-text>
	{/if}
	<fem-button slot="actions" kind="soft" onclick={handleNewPlaylist}>
		<fem-icon name="plus"></fem-icon>
		New playlist
	</fem-button>
	<fem-button slot="actions" onclick={props.onClose}>Done</fem-button>
</fem-dialog>
