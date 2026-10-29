<script lang="ts">
	import { checkIsOwnSlug, studio } from '../data/studio.svelte'
	import { readValue } from './read-value'
	import { navigate, router } from '../routing/router.svelte'
	import { buildArtistPath, followingPath, savedPath } from '../routing/routes'
	import type { RouteT } from '../routing/routes'

	type AppTabT = 'me' | 'following' | 'saved' | ''

	// The signed-in artist's way around: their own page,
	// who they follow, what they saved. Messages is coming.
	const getRouteArtistSlug = (route: RouteT): string => {
		const hasArtist = 'artistSlug' in route
		if (!hasArtist) return ''
		return route.artistSlug
	}

	const getSelectedTab = (route: RouteT): AppTabT => {
		const isFollowing = route.kind === 'following'
		if (isFollowing) return 'following'
		const isSaved = route.kind === 'saved'
		if (isSaved) return 'saved'
		const isOwnPage = checkIsOwnSlug(getRouteArtistSlug(route))
		if (isOwnPage) return 'me'
		return ''
	}

	const selectedTab = $derived(getSelectedTab(router.route))
	const ownPagePath = $derived(buildArtistPath(studio.artist?.slug ?? ''))

	const tabPaths = $derived<Record<string, string>>({
		me: ownPagePath,
		following: followingPath,
		saved: savedPath
	})

	const handleChange = (event: Event) => {
		const tab = readValue(event)
		const path = tabPaths[tab]
		if (path) navigate(path)
	}
</script>

<fem-tab-bar class="app-tabs" label="femes" value={selectedTab} onchange={handleChange}>
	<fem-tab-bar-item value="me"><fem-icon slot="icon" name="user"></fem-icon>Me</fem-tab-bar-item>
	<fem-tab-bar-item value="following"><fem-icon slot="icon" name="users"></fem-icon>Following</fem-tab-bar-item>
	<fem-tab-bar-item value="saved"><fem-icon slot="icon" name="bookmark-simple"></fem-icon>Saved</fem-tab-bar-item>
	<fem-tab-bar-item value="messages" disabled><fem-icon slot="icon" name="chat-circle"></fem-icon>Messages</fem-tab-bar-item>
</fem-tab-bar>
