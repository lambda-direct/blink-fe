<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ChartColors } from '../+page.svelte';

	export let colorsMap: ChartColors = {};
	export let selected: string | null = null;

	const dispatch = createEventDispatcher<{ codeSelect: string }>();

	function selectCode(code: string) {
		dispatch('codeSelect', code); 
	}
</script>

<div class="ml-12 flex flex-wrap gap-6">
	{#each Object.keys(colorsMap) as code}
		<button
			class="flex group items-center gap-1"
			on:click={() => selectCode(code)}
			style="color: {colorsMap[code]}"
		>
			<span
				class="w-3 h-3 rounded-full"
				style="background-color: {colorsMap[code]}"
			></span> 
			<span
				class={`text-sm font-medium 
					${selected === code || Object.keys(colorsMap).length === 1 ? 'text-white underline' : 'text-neutral-500'}
					group-hover:text-white transition-colors duration-200`}
			>
				{code}
			</span>
		</button>
	{/each}
</div>
