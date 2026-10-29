<script lang="ts">
	type AddressT = {
		path: string
		meaning: string
	}

	// The addresses are the product. Each one reads like
	// a sentence.
	const host = window.location.host

	const addresses: AddressT[] = [
		{ path: '/tasteink', meaning: 'Your page' },
		{ path: '/tasteink/track/safeword', meaning: 'One song' },
		{ path: '/tasteink/playlist/late-night-drafts', meaning: 'A playlist' }
	]
</script>

<div class="home-split">
	<div class="home-split-intro">
		<h2 class="home-section-heading">Links that say what they are.</h2>
		<p class="home-section-text">Every song and playlist gets an address made from its name. Rename a song and the old link still works.</p>
	</div>
	<ul class="home-addresses">
		{#each addresses as address (address.path)}
			<li class="home-address">
				<span class="home-address-url"><span class="home-address-host">{host}</span>{address.path}</span>
				<span class="home-address-meaning">{address.meaning}</span>
			</li>
		{/each}
	</ul>
</div>
