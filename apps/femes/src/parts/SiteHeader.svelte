<script lang="ts">
	import type { Snippet } from 'svelte'

	type SiteHeaderPropsT = {
		end?: Snippet
	}

	const props: SiteHeaderPropsT = $props()
</script>

<header class="site-header">
	<a class="site-brand" href="/">femes</a>
	<div class="site-header-end">
		{@render props.end?.()}
	</div>
</header>
