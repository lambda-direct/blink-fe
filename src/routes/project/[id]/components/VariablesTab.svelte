<script lang="ts">
	import { writable } from 'svelte/store';
	import type { GetServiceResponse } from '../../../../api/services';
	import { Eye, EyeOff, Copy, Check, Asterisk } from 'lucide-svelte';
	export let variables: GetServiceResponse['environmentVariables'] = [];

	type EnvironmentVariable = GetServiceResponse['environmentVariables'][0];

	const mockedVariables = [
		{
			id: '1',
			name: 'PORT',
			value: '3000',
			createdAt: 1730307600000
		},
		{
			id: '2',
			name: 'USER',
			value: 'admin_user',
			createdAt: 1730307600000
		},
		{
			id: '3',
			name: 'URL',
			value: 'https://example.com',
			createdAt: 1730307600000
		},
		{
			id: '4',
			name: 'PASSWORD',
			value: 's3cur3P@sw0rd!',
			createdAt: 1730307600000
		},
		{
			id: '5',
			name: 'HOST',
			value: 'localhost',
			createdAt: 1730307600000
		}
	];

	const showValueMap = writable(
		new Map<string, boolean>(mockedVariables.map((v) => [v.id, false]))
	);
	const copiedMap = writable(new Map<string, boolean>());

	function toggleShowValue(id: string) {
		showValueMap.update((currentMap) => {
			mockedVariables.forEach((v) => {
				if (v.id !== id) {
					currentMap.set(v.id, false);
				}
			});

			const currentShow = currentMap.get(id) || false;
			currentMap.set(id, !currentShow);

			if (!currentShow) {
				setTimeout(() => {
					currentMap.set(id, false);
					showValueMap.set(currentMap);
				}, 10000);
			}

			return currentMap;
		});
	}

	async function copyToClipboard(id: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copiedMap.update((currentMap) => {
				currentMap.set(id, true);
				return currentMap;
			});

			setTimeout(() => {
				copiedMap.update((currentMap) => {
					currentMap.set(id, false);
					return currentMap;
				});
			}, 2000);
		} catch (error) {
			console.error('Failed to copy text: ', error);
		}
	}
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-medium text-neutral-400">
		{mockedVariables.length} Environment
		{mockedVariables.length === 1 ? 'Variable' : 'Variables'}
		!MOCKED!
	</h2>
	{#each mockedVariables as { name, value, id }}
		<div class="group/item flex w-full gap-4">
			<div
				class="group-hover/item:bg-accent flex h-9 w-full items-center overflow-hidden rounded-lg border px-6 text-sm"
			>
				<span class="truncate">{name}</span>
			</div>
			<div
				class="group/value group-hover/item:bg-accent flex h-9 w-full items-center justify-between gap-2 overflow-hidden rounded-lg border px-6 text-sm"
			>
				<div class="truncate">
					{#if $showValueMap.get(id)}
						{value}
					{:else}
						<div class="flex">
							{#each Array(8) as _}
								<Asterisk class="h-4 w-4" />
							{/each}
						</div>
					{/if}
				</div>
				<div class="flex gap-1 text-neutral-400 opacity-0 group-hover/value:opacity-100">
					<button class="p-1" on:click={() => toggleShowValue(id)} aria-label="show value">
						{#if $showValueMap.get(id)}
							<Eye class="h-4 w-4" />
						{:else}
							<EyeOff class="h-4 w-4" />
						{/if}
					</button>
					<button
						class="p-1"
						on:click={() => copyToClipboard(id, value)}
						aria-label="copy to clipboard"
					>
						{#if $copiedMap.get(id)}
							<Check class="h-4 w-4" />
						{:else}
							<Copy class="h-4 w-4" />
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/each}
</div>
