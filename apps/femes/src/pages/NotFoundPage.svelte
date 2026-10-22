<script lang="ts">
	import SiteHeader from '../parts/SiteHeader.svelte'

	const handleBack = () => history.back()
</script>

<div class="app-page">
	<SiteHeader />
	<fem-empty-state heading="Nothing here">
		<fem-icon slot="icon" name="music-notes"></fem-icon>
		This link may be old, or the track was made private.
		<fem-button slot="actions" kind="soft" onclick={handleBack}>Go back</fem-button>
	</fem-empty-state>
</div>
