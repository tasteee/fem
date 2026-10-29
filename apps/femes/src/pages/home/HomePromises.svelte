<script lang="ts">
	type PromiseT = {
		heading: string
		text: string
	}

	const promises: PromiseT[] = [
		{
			heading: 'No ads',
			text: 'Nothing plays before your song, and nothing plays after it.'
		},
		{
			heading: 'No sign-up to listen',
			text: 'Send a link. It opens and plays. That is the whole flow.'
		},
		{
			heading: 'Play it anywhere',
			text: 'Links show artwork in messages, and every song has an embed player for your own site.'
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
