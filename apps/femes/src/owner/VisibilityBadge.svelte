<script lang="ts">
	import type { VisibilityT } from '../data/types'

	type VisibilityBadgePropsT = {
		visibility: VisibilityT
	}

	// Only the owner sees this, and only for things that
	// aren't public.
	const props: VisibilityBadgePropsT = $props()

	const labels: Record<VisibilityT, string> = {
		public: '',
		unlisted: 'Unlisted',
		private: 'Private'
	}

	const label = $derived(labels[props.visibility])
	const isHidden = $derived(label !== '')
</script>

{#if isHidden}
	<fem-badge>{label}</fem-badge>
{/if}
