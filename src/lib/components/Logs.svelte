<script lang="ts">
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuCheckboxItem
	} from '$lib/components/ui/dropdown-menu';
	import { EllipsisVertical } from 'lucide-svelte';
	import { format } from 'date-fns';
	import { tick } from 'svelte';

	export let parsedLogs: { timestamp: Date | null; message: string }[] = [];
	export let type: 'general' | 'service';

	let hoveredLogIndex = - 1;
	let scrollContainer: HTMLDivElement | null = null;

	let options = [{ label: 'Timestamp', checked: true }];

	const getTimezone = () => {
		const offset = new Date().getTimezoneOffset();
		const offsetHours = -offset / 60;
		const timezoneString = `UTC ${offsetHours >= 0 ? '+' : ''}${offsetHours}`;
		return timezoneString;
	};

	async function scrollToBottom() {
		await tick();
		if (scrollContainer) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	}
	const handleCheckboxChange = (label: string, isChecked: boolean) => {
		if (label === 'Timestamp') {
			showDateColumn = !isChecked;
		}
	};

	$: if (parsedLogs) {
		hoveredLogIndex = 0;
		scrollToBottom();
	}
	$: showDateColumn = parsedLogs.some((log) => log.timestamp);
</script>

<div
	class="bg-accent relative flex h-full w-full flex-col overflow-hidden rounded-lg border text-sm"
>
	{#if parsedLogs.some((log) => log.timestamp)}
		<div class="absolute right-4 top-4 text-neutral-400 hover:text-white">
			<DropdownMenu closeOnItemClick={false}>
				<DropdownMenuTrigger><EllipsisVertical class="h-4 w-4" /></DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{#each options as { label, checked }}
						<DropdownMenuCheckboxItem
							bind:checked
							onCheckedChange={() => handleCheckboxChange(label, checked)}
						>
							{label}
						</DropdownMenuCheckboxItem>
					{/each}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	{/if}
	<div class="flex h-full w-full flex-col">
		<div class="mb-1 flex rounded-t-lg bg-[#33323e] px-2 py-1">
			{#if showDateColumn}
				<div class="mr-4 {type === 'general' ? 'w-1/6' : 'w-1/5'} p-2">Date ({getTimezone()})</div>
			{/if}
			<div class="{type === 'general' ? 'w-5/6' : 'w-4/5'} p-2">Message</div>
		</div>
		<div
			class="bg-accent scrollbar scrollbar-track-accent scrollbar-thumb-[#33323e] flex h-fit w-full flex-col-reverse overflow-y-auto overflow-x-hidden rounded-b-lg px-2 pb-2"
			bind:this={scrollContainer}
		>
			{#each parsedLogs as log, i}
				<div
					class="flex border-t hover:rounded-lg hover:bg-[#33323e] {i === hoveredLogIndex
						? 'rounded-lg bg-[#33323e]'
						: ''}"
					on:mouseenter={() => (hoveredLogIndex = i)}
					on:mouseleave={() => (hoveredLogIndex = -1)}
					role="listitem"
				>
					{#if showDateColumn}
						<div
							class="mr-4 {type === 'general'
								? 'w-1/6'
								: 'w-1/5'} whitespace-normal break-words p-2 text-left text-neutral-400"
						>
							{#if log.timestamp}
								<span
									>{format(new Date(log.timestamp), 'MMM ')}
									{format(new Date(log.timestamp), 'dd ')}&nbsp;</span
								>
								<span class="ml-1">{format(new Date(log.timestamp), 'HH : mm : ss')}</span>
							{:else}
								No date
							{/if}
						</div>
					{/if}
					<div
						class="{type === 'general'
							? 'w-5/6'
							: 'w-4/5'} whitespace-normal break-words p-2 text-left"
					>
						{log.message}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
