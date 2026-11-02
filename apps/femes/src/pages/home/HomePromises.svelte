<script lang="ts">
	type PromiseT = {
		heading: string
		text: string
	}

	const promises: PromiseT[] = [
		{
			heading: 'Upload your tracks',
			text: 'Drop in your songs. Each one gets its own page, ready to play.'
		},
		{
			heading: 'No ads or interruptions',
			text: 'Nothing plays before your song, and nothing plays after it.'
		},
		{
			heading: 'Share with anyone',
			text: 'Send a link. It opens and plays, and listeners never need an account.'
		},
		{
			heading: 'Less overwhelm',
			text: 'Like SoundCloud, minus the noise. Just your music, in a quiet place.'
		}
	]
</script>

<ul class="home-promises">
	{#each promises as promise (promise.heading)}
		<li class="home-promise">
			<h3 class="home-promise-heading">{promise.heading}</h3>
			<p class="home-promise-text">{promise.text}</p>
		</li>
	{/each}
</ul>
