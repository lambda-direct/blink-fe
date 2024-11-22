<script lang="ts">
	import { Check, Copy, Github } from 'lucide-svelte';
	import { writable } from 'svelte/store';
	const copiedMap = writable(new Map<string, boolean>());
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
			console.error('Failed to copy command: ', error);
		}
	}
	const githubAuthUrl = import.meta.env.VITE_GITHUB_AUTH_URL;
</script>

<div class="h-full overflow-auto">
	<div class="mx-auto flex max-w-screen-lg flex-col flex-col items-center gap-5">
		<div class="mt-10 flex h-fit text-center text-white">
			<h1 class="text-4xl font-medium">
				Welcome to <span class="text-[#a667e4]">Dokkulify</span> CLient!
			</h1>
		</div>
		<div class="flex w-full max-w-lg flex-col items-start gap-4 text-white">
			<h2 class="text-2xl">Usage Guide:</h2>
			<div class="flex w-full flex-col gap-4 text-lg">
				<div class="flex items-center gap-4">
					<div class="flex gap-2">
						<span class="text-xl">•</span>
						<span class="whitespace-nowrap">Install via CLI</span>
					</div>
					<div
						class="group relative flex h-fit w-full max-w-full items-center gap-2 rounded-lg border px-4 py-1"
					>
						<code class="flex-grow text-base group-hover:text-[#a667e4]">npm install dokkulify</code
						>
						<button
							class="flex-shrink-0 opacity-0 group-hover:opacity-100"
							on:click={() => copyToClipboard('install', 'npm install dokkulify')}
							aria-label="copy to clipboard"
						>
							{#if $copiedMap.get('install')}
								<Check class="h-4 w-4" />
							{:else}
								<Copy class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<div class="flex gap-2">
						<span class="text-xl">•</span>
						<span class="whitespace-nowrap">Authenticate via CLI</span>
					</div>
					<div
						class="group relative flex h-fit w-full max-w-full items-center gap-2 rounded-lg border px-4 py-1"
					>
						<code class="flex-grow text-base group-hover:text-[#a667e4]">dokkulify auth</code>
						<button
							class="flex-shrink-0 opacity-0 group-hover:opacity-100"
							on:click={() => copyToClipboard('install', 'npm install dokkulify')}
							aria-label="copy to clipboard"
						>
							{#if $copiedMap.get('install')}
								<Check class="h-4 w-4" />
							{:else}
								<Copy class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>
				<div class="flex items-start gap-2">
					<span class="text-xl">•</span>
					<span>Sign in with GitHub</span>
				</div>
				<div class="flex items-start gap-2">
					<span class="text-xl">•</span>
					<span>Enjoy using Dokkulify!</span>
				</div>
			</div>
		</div>

		<div class="w-full max-w-lg flex items-center my-4 mx-auto">
			<div class="flex-grow border-t border-gray-600"></div>
			<span class="mx-4 text-gray-600">OR</span>
			<div class="flex-grow border-t border-gray-600"></div>
		</div>

		<button
			on:click={() => (window.location.href = githubAuthUrl)}
			class="flex w-fit items-center justify-center gap-2 rounded-lg bg-[#853bce] px-4 py-2 text-white hover:bg-[#a667e4]"
		>
			<Github class="h-5 w-5" />
			<span>Sign in with GitHub</span>
		</button>

		<div
			class="bg-accent mb-4 flex w-full min-h-[500px] flex-1 items-center justify-center rounded-lg border p-4"
		>
			<p class="text-center text-xl">Here will be demo</p>
		</div>
	</div>
</div>
