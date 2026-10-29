<script lang="ts">
	import type { ArtistT } from '../data/types'
	import { checkIsFollowing, checkIsOwnSlug, checkIsSignedInArtist, toggleFollow } from '../data/viewer.svelte'

	type FollowButtonPropsT = {
		artist: ArtistT
	}

	// Only signed-in artists see it. There are no follower
	// counts anywhere.
	const props: FollowButtonPropsT = $props()


	const isSelf = $derived(checkIsOwnSlug(props.artist.slug))
	const canFollow = $derived(checkIsSignedInArtist() && !isSelf)
	const isFollowing = $derived(checkIsFollowing(props.artist.id))
	const label = $derived(isFollowing ? 'Following' : 'Follow')
	const iconName = $derived(isFollowing ? 'user-check' : 'user-plus')
	const kind = $derived(isFollowing ? 'solid' : 'soft')

	const handleClick = () => toggleFollow(props.artist.id)
</script>

{#if canFollow}
	<fem-button {kind} onclick={handleClick}>
		<fem-icon name={iconName} size="small"></fem-icon>
		{label}
	</fem-button>
{/if}
