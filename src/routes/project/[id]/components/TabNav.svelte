<script lang="ts">
	import type { Tab } from '../+page.svelte';

	export let activeTab: string;
	export let onTabSelect: (tab: Tab) => void;

	let tabs: { name: Tab; label: string }[] = [
		{ name: 'settings', label: 'Settings' },
		{ name: 'variables', label: 'Variables' },
		{ name: 'metrics', label: 'Metrics' },
		{ name: 'logs', label: 'Logs' },
		{ name: 'mounts', label: 'Mounts' }
	];

</script>

<div class="flex flex-wrap gap-8 border-b px-6 md:px-12">
	{#each tabs as { name, label }}
		<button
			class="relative h-6 font-medium transition-colors hover:text-white md:h-10
		{activeTab === name
				? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
				: 'text-neutral-400'}"
			on:click={() => onTabSelect(name)}
		>
			{label}
		</button>
	{/each}
</div>
<div class="h-full overflow-y-auto overflow-x-hidden px-6 py-4 md:px-12">
	<slot />
</div>
