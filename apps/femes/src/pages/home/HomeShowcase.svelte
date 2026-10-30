<script lang="ts">
	import { siteHost } from '../../site'
	import { demoArtists, demoTracks } from '../../data/demo-catalog'

	// A real, playable artist page in miniature. It reads
	// the demo catalog so it works before anyone signs up.
	const artist = demoArtists[0]
	const tracks = demoTracks
	const pageAddress = `${siteHost}/${artist.slug}`
</script>

<figure class="home-showcase">
	<div class="home-showcase-bar">
		<span class="home-showcase-address">{pageAddress}</span>
	</div>
	<div class="home-showcase-page">
		<div class="home-showcase-artist">
			<fem-avatar size="large" name={artist.name} src={artist.avatarUrl}></fem-avatar>
			<div class="home-showcase-identity">
				<span class="home-showcase-name">{artist.name}</span>
				<span class="home-showcase-bio">{artist.bio}</span>
			</div>
		</div>
		<div class="track-list">
			{#each tracks as track (track.id)}
				<fem-track-row {track} queue={tracks}></fem-track-row>
			{/each}
		</div>
	</div>
	<figcaption class="home-showcase-caption">This is a working page. Press play.</figcaption>
</figure>
