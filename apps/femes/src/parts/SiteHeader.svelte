<script lang="ts">
	import type { Snippet } from 'svelte'
	import HeaderNav from './HeaderNav.svelte'

	type SiteHeaderPropsT = {
		end?: Snippet
	}

	const props: SiteHeaderPropsT = $props()
</script>

<header class="site-header">
	<a class="site-brand" href="/">femes</a>
	<div class="site-header-end">
		<HeaderNav />
		{@render props.end?.()}
	</div>
</header>
