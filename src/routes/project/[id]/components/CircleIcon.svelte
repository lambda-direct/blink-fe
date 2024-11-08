<script lang="ts">
	import type { IconProps } from 'lucide-svelte';
	import type { SvelteComponent } from 'svelte';

	export let icon: typeof SvelteComponent<IconProps> | null = null;
</script>

<div class="flex h-10 w-10 items-center justify-center rounded-full border">
	{#if icon}
		<svelte:component this={icon} class="h-4 w-4" />
	{:else}
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path
				d="M2.836 5.664 7 7m0 0 1.086 3.914M7 7l-6 6m9.67-4.67L9.582 4.418m0 0L5.377 3.039m4.206 1.378L13 1"
			/>
		</svg>
	{/if}
</div>
