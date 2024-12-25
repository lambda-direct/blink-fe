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

	export let logs: { createdAt: number; service?: string; message: string }[] = [];
	export let type: 'general' | 'service';

	let hoveredLogIndex = -1;
	let scrollContainer: HTMLDivElement | null = null;

	const hasDate = logs.some((log) => log.createdAt !== 0);
	const hasService = logs.some((log) => log.service);

	let options = [
		...(hasDate ? [{ label: 'Timestamp', checked: true }] : []),
		...(hasService ? [{ label: 'Service', checked: true }] : [])
	];

	let showServiceColumn = hasService;
	let showDateColumn = hasDate;

	let columnWidths: { dateWidth: string; serviceWidth: string; messageWidth: string } = {
		dateWidth: '',
		serviceWidth: '',
		messageWidth: ''
	};

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
		} else if (label === 'Service') {
			showServiceColumn = !isChecked;
		}
	};

	$: if (logs) {
		hoveredLogIndex = logs.length - 1;
		scrollToBottom();
	}

	$: {
		let dateWidth = '';
		let serviceWidth = '';
		let messageWidth = '';

		if (type === 'general') {
			dateWidth = 'w-1/6';
			serviceWidth = showServiceColumn ? 'w-1/6' : '';
			messageWidth = showServiceColumn ? 'w-4/6' : 'w-5/6';
		} else if (type === 'service') {
			dateWidth = 'w-1/5';
			serviceWidth = showServiceColumn ? 'w-1/5' : '';
			messageWidth = showServiceColumn ? 'w-3/5' : 'w-4/5';
		}

		columnWidths = { dateWidth, serviceWidth, messageWidth };
	}
</script>

<div
	class="bg-accent relative flex h-full w-full flex-col overflow-hidden rounded-lg border text-sm"
>
	{#if logs.some((log) => log.createdAt)}
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
		<div class="mb-1 flex gap-2 rounded-t-lg bg-[#33323e] px-2 py-1">
			{#if showDateColumn}
				<div class="{columnWidths.dateWidth} p-2">
					Date <span class="whitespace-nowrap">({getTimezone()})</span>
				</div>
			{/if}
			{#if showServiceColumn}
				<div class="{columnWidths.serviceWidth} p-2">Service</div>
			{/if}
			<div class="{columnWidths.messageWidth} p-2">Message</div>
		</div>
		<div
			class="bg-accent scrollbar scrollbar-track-accent scrollbar-thumb-[#33323e] flex h-fit w-full flex-col overflow-y-auto overflow-x-hidden rounded-b-lg px-2 pb-2"
			bind:this={scrollContainer}
		>
			{#each logs as log, i}
				<div
					class="flex gap-2 border-t hover:rounded-lg hover:bg-[#33323e] {i === hoveredLogIndex
						? 'rounded-lg bg-[#33323e]'
						: ''}"
					on:mouseenter={() => (hoveredLogIndex = i)}
					on:mouseleave={() => (hoveredLogIndex = -1)}
					role="listitem"
				>
					{#if showDateColumn}
						<div class="{columnWidths.dateWidth} p-2 text-left text-neutral-400">
							{#if log.createdAt}
								<span class="whitespace-nowrap"
									>{format(new Date(log.createdAt), 'MMM ')}
									{format(new Date(log.createdAt), 'dd ')}&nbsp;</span
								>
								<span class="ml-1 whitespace-nowrap"
									>{format(new Date(log.createdAt), 'HH : mm : ss')}</span
								>
							{:else}
								No date
							{/if}
						</div>
					{/if}
					{#if showServiceColumn}
						<div class="{columnWidths.serviceWidth} p-2 text-left">
							{log.service}
						</div>
					{/if}

					<div class="{columnWidths.messageWidth} whitespace-normal break-words p-2 text-left">
						{log.message}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
