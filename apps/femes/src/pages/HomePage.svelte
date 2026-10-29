<script lang="ts">
	import { studio } from '../data/studio.svelte'
	import SiteHeader from '../parts/SiteHeader.svelte'
	import HomeAddresses from './home/HomeAddresses.svelte'
	import HomePromises from './home/HomePromises.svelte'
	import HomeShowcase from './home/HomeShowcase.svelte'

	const signInPath = '/signin'
	const examplePath = '/tasteink'
	const isSignedOut = $derived(studio.status !== 'ready')
</script>

<div class="home">
	<div class="home-frame">
		<SiteHeader>
			{#snippet end()}
				{#if isSignedOut}
					<a class="home-header-link" href={signInPath}>Sign in</a>
				{/if}
			{/snippet}
		</SiteHeader>
	</div>

	<section class="home-hero home-frame">
		<h1 class="home-headline">
			<span class="home-headline-line">A quiet place</span>
			<span class="home-headline-line">for your music.</span>
		</h1>
		<div class="home-hero-end">
			<p class="home-lede">Upload your songs, get a clean link for each one, and share it anywhere. No ads, and listeners never need an account.</p>
			<div class="home-actions">
				<a class="home-action isPrimary" href={signInPath}>Start your page</a>
				<a class="home-action" href={examplePath}>Hear an example</a>
			</div>
		</div>
	</section>

	<section class="home-frame">
		<HomeShowcase />
	</section>

	<section class="home-frame">
		<HomeAddresses />
	</section>

	<section class="home-frame">
		<HomePromises />
	</section>

	<section class="home-closing home-frame">
		<h2 class="home-closing-heading">Your songs deserve a quiet room.</h2>
		<a class="home-action isPrimary" href={signInPath}>Start your page</a>
	</section>

	<footer class="home-frame">
		<div class="home-footer">
			<span class="site-brand">femes</span>
			<span class="home-footer-note">Free for artists. Free for listeners.</span>
		</div>
	</footer>
</div>
