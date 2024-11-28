<script lang="ts">
	import type { Tab } from '../+page.svelte';

	export let activeTab: string;
	export let onTabSelect: (tab: Tab) => void;
	export let hasMounts: boolean = false;
</script>

<div class="flex gap-8 border-b px-12">
	<button
		class="relative h-10 font-medium transition-colors hover:text-white {activeTab === 'settings'
			? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
			: 'text-neutral-400'}"
		on:click={() => onTabSelect('settings')}
	>
		Settings
	</button>
	<button
		class="relative h-10 font-medium transition-colors hover:text-white {activeTab === 'variables'
			? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
			: 'text-neutral-400'}"
		on:click={() => onTabSelect('variables')}
	>
		Variables
	</button>
	<button
		class="relative h-10 font-medium transition-colors hover:text-white {activeTab === 'metrics'
			? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
			: 'text-neutral-400'}"
		on:click={() => onTabSelect('metrics')}
	>
		Metrics
	</button>
	<button
		class="relative h-10 font-medium transition-colors hover:text-white {activeTab === 'logs'
			? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
			: 'text-neutral-400'}"
		on:click={() => onTabSelect('logs')}
	>
		Logs
	</button>
	{#if hasMounts}
		<button
			class="relative h-10 font-medium transition-colors hover:text-white {activeTab === 'mounts'
				? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
				: 'text-neutral-400'}"
			on:click={() => onTabSelect('mounts')}
		>
			Mounts
		</button>
	{/if}
</div>
<div class="h-full overflow-y-auto overflow-x-hidden px-12 py-4">
	<slot />
</div>
