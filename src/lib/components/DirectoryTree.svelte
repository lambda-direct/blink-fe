<script lang="ts">
	import { writable, get } from 'svelte/store';
	import { ChevronRight, ChevronDown, Folder, File } from 'lucide-svelte';
	import { selectedInstanceId } from '../../stores/instanceStore';
	import { getBindMountEntries, type GetBindMountEntriesResponse } from '../../api/services';
	import { Diamonds, Pulse, SyncLoader } from 'svelte-loading-spinners';

	export let projectId: string;
	export let serviceId: string;
	export let mountId: string;
	export let path: string = '/';
	export let name: string;

	let directoryContents = writable<Record<string, GetBindMountEntriesResponse['entries']>>({});
	let expandedPaths = writable<Record<string, boolean>>({});
	let lastLoadingPath = writable<string | null>(null);

	async function toggleDirectory(path: string) {
		let currentState = get(expandedPaths)[path] || false;
		expandedPaths.update((state) => ({ ...state, [path]: !currentState }));

		if (get(directoryContents)[path]) {
			return;
		}
		try {
			lastLoadingPath.set(path);
			const response = await getBindMountEntries(
				$selectedInstanceId!,
				projectId,
				serviceId,
				mountId,
				{ path }
			);
			directoryContents.update((state) => ({
				...state,
				[path]: response.data.entries || []
			}));
			expandedPaths.update((state) => ({ ...state, [path]: true }));
		} catch (error) {
			console.error(`Failed to fetch directory contents`, error);
		} finally {
			lastLoadingPath.set(null);
		}
	}

	function getDirectoryItems(path: string) {
		return get(directoryContents)[path] || [];
	}
</script>

<div class="group flex items-center gap-2">
	<button on:click={() => toggleDirectory(path)}>
		{#if $expandedPaths[path]}
			<ChevronDown class="h-4 w-4 text-neutral-400 group-hover:text-white" />
		{:else}
			<ChevronRight class="h-4 w-4 text-neutral-400 group-hover:text-white" />
		{/if}
	</button>
	{#if path !== '/'}
		<Folder class="h-4 w-4" />{/if}
	<span class="underline-offset-4 group-hover:underline">{name}</span>
</div>

{#if $expandedPaths[path]}
	<div class={path === '/' ? 'mt-4' : ''}>
		{#if $lastLoadingPath === path}
			<div class="ml-12">
				<Diamonds size="24" color="#737373" />
			</div>
		{:else if getDirectoryItems(path).length > 0}
			<div class="ml-12 flex flex-col gap-4">
				{#each getDirectoryItems(path) as entry}
					{#if entry.type === 'DIRECTORY'}
						<svelte:self
							{projectId}
							{serviceId}
							{mountId}
							path={`${path}/${entry.name}`}
							name={entry.name}
						/>
					{:else}
						<div class="flex items-center gap-2">
							<File class="h-4 w-4" />
							<span>{entry.name}</span>
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="ml-12 text-sm text-neutral-400">This folder is empty</div>
		{/if}
	</div>
{/if}
