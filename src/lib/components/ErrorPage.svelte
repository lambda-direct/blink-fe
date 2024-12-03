<script lang="ts">
	import { goto } from '$app/navigation';
	import { Compass } from 'lucide-svelte';

	export let status: number;
	export let message: string;

	function handleGoBack() {
		goto('/dashboard');
	}
</script>

<div class="flex h-full flex-col items-center justify-center gap-8 text-center -mt-16">
	<Compass class="h-16 w-16" />
	<h1 class="text-4xl font-bold">{status} {message}</h1>
	<button
		on:click={handleGoBack}
		class="rounded-lg bg-[#853bce] px-3 py-2 text-white hover:bg-[#A667E4]"
	>
		Go Back to Dashboard
	</button>
</div>
