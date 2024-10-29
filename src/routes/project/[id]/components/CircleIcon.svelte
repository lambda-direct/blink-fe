<script lang="ts">
	export let icon;
</script>

<div class="flex h-10 w-10 items-center justify-center rounded-full border">
    <svelte:component this={icon} class="h-4 w-4" />
</div>
