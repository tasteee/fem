<script lang="ts">
	import type { Snippet } from 'svelte'
	import { ensureStudio, signOutOfStudio, studio } from '../../data/studio.svelte'
	import { readValue } from '../../parts/read-value'
	import SiteHeader from '../../parts/SiteHeader.svelte'
	import { navigate } from '../../routing/router.svelte'
	import { buildArtistPath, studioPaths } from '../../routing/routes'
	import Onboarding from './Onboarding.svelte'

	export type StudioSectionT = 'tracks' | 'playlists' | 'profile'

	type StudioShellPropsT = {
		section: StudioSectionT
		children: Snippet
	}

	const props: StudioShellPropsT = $props()

	ensureStudio()

	// Signed-out visitors go to sign in.
	$effect(() => {
		const isSignedOut = studio.status === 'signed-out'
		if (isSignedOut) navigate('/signin')
	})

	const isLoading = $derived(studio.status === 'loading')
	const isReady = $derived(studio.status === 'ready')
	const needsArtist = $derived(studio.status === 'no-artist')
	const hasFailed = $derived(studio.status === 'failed')
	const publicPath = $derived(studio.artist ? buildArtistPath(studio.artist.slug) : '/')

	const handleSectionChange = (event: Event) => {
		const section = readValue(event) as StudioSectionT
		navigate(studioPaths[section])
	}

	const handleSignOut = async () => {
		await signOutOfStudio()
		navigate('/')
	}

	const handleRetry = () => window.location.reload()
</script>

{#if isLoading}
	<div class="app-page studio-center">
		<fem-spinner size="large" label="Loading your studio"></fem-spinner>
	</div>
{:else if needsArtist}
	<div class="app-page">
		<SiteHeader />
		<Onboarding />
	</div>
{:else if hasFailed}
	<div class="app-page">
		<SiteHeader />
		<fem-empty-state heading="Couldn't load your studio">
			Check your connection and try again.
			<fem-button slot="actions" kind="soft" onclick={handleRetry}>Try again</fem-button>
		</fem-empty-state>
	</div>
{:else if isReady}
	<div class="studio">
		<aside class="studio-side">
			<a class="site-brand studio-brand" href="/">femes</a>
			<fem-nav label="Studio" value={props.section} onchange={handleSectionChange}>
				<fem-nav-item value="tracks"><fem-icon slot="icon" name="music-notes"></fem-icon>Tracks</fem-nav-item>
				<fem-nav-item value="playlists"><fem-icon slot="icon" name="list"></fem-icon>Playlists</fem-nav-item>
				<fem-nav-item value="profile"><fem-icon slot="icon" name="user"></fem-icon>Profile</fem-nav-item>
			</fem-nav>
			<div class="studio-side-end">
				<a class="studio-side-link" href={publicPath}>
					<fem-icon name="arrow-square-out" size="small"></fem-icon>
					View public page
				</a>
				<fem-button kind="ghost" size="small" onclick={handleSignOut}>Sign out</fem-button>
			</div>
		</aside>
		<div class="studio-top">
			<a class="site-brand" href="/">femes</a>
			<fem-segmented value={props.section} onchange={handleSectionChange}>
				<fem-segment value="tracks">Tracks</fem-segment>
				<fem-segment value="playlists">Playlists</fem-segment>
				<fem-segment value="profile">Profile</fem-segment>
			</fem-segmented>
		</div>
		<main class="studio-main">
			{@render props.children()}
		</main>
	</div>
{/if}
