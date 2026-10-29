<script lang="ts">
	import { checkIsOwnSlug, studio } from '../data/studio.svelte'
	import { router } from '../routing/router.svelte'
	import type { RouteT } from '../routing/routes'
	import { buildArtistPath, followingPath, savedPath } from '../routing/routes'

	type NavLinkT = {
		key: string
		label: string
		path: string
	}

	// On a wide screen the tab bar's links live here, in
	// the header. A phone uses the bottom tab bar instead.
	const getRouteArtistSlug = (route: RouteT): string => {
		const hasArtist = 'artistSlug' in route
		if (!hasArtist) return ''
		return route.artistSlug
	}

	const getCurrentKey = (route: RouteT): string => {
		const isFollowing = route.kind === 'following'
		if (isFollowing) return 'following'
		const isSaved = route.kind === 'saved'
		if (isSaved) return 'saved'
		const isOwnPage = checkIsOwnSlug(getRouteArtistSlug(route))
		if (isOwnPage) return 'me'
		return ''
	}

	const isSignedIn = $derived(studio.status === 'ready')
	const currentKey = $derived(getCurrentKey(router.route))
	const ownPagePath = $derived(buildArtistPath(studio.artist?.slug ?? ''))

	const links = $derived<NavLinkT[]>([
		{ key: 'me', label: 'Me', path: ownPagePath },
		{ key: 'following', label: 'Following', path: followingPath },
		{ key: 'saved', label: 'Saved', path: savedPath }
	])

	const buildClassName = (link: NavLinkT): string => {
		const isCurrent = link.key === currentKey
		if (isCurrent) return 'header-nav-link isCurrent'
		return 'header-nav-link'
	}

	const getAriaCurrent = (link: NavLinkT) => {
		const isCurrent = link.key === currentKey
		if (isCurrent) return 'page'
		return undefined
	}
</script>

{#if isSignedIn}
	<nav class="header-nav" aria-label="femes">
		{#each links as link (link.key)}
			<a class={buildClassName(link)} href={link.path} aria-current={getAriaCurrent(link)}>{link.label}</a>
		{/each}
		<span class="header-nav-link isDisabled" aria-disabled="true" title="Coming soon">Messages</span>
	</nav>
{/if}
