<script>
	import { goto } from '$app/navigation';

	import Counter from './Counter.svelte';
	import { ChevronDown, SquarePlus, Settings, Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Alert from '$lib/components/ui/alert';

	let showStatusBar = true;

	function handleGoToAccount() {
		goto('account');
	}
</script>

<section class="mt-20">
	<div class="flex flex-col gap-y-4">
		<div class="flex items-center justify-between">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button builders={[builder]} class="gap-x-2 text-neutral-50" variant="ghost">
						<Avatar.Root class="h-6 w-6">
							<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
							<Avatar.Fallback>CN</Avatar.Fallback>
						</Avatar.Root>
						<span class="text-xl">John Doe</span>
						<span
							class="me-2 rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium uppercase text-green-800 dark:bg-green-900 dark:text-green-300"
						>
							trial
						</span>
						<ChevronDown class="h-4 w-4" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56" align="end">
					<DropdownMenu.Label>Select a workspace</DropdownMenu.Label>
					<DropdownMenu.CheckboxItem bind:checked={showStatusBar}>
						John Doe
					</DropdownMenu.CheckboxItem>
					<DropdownMenu.Separator />
					<DropdownMenu.Item class="flex items-center gap-x-2">
						<SquarePlus class="h-4 w-4" />
						Create Team
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<div class="flex gap-x-2">
				<Button variant="outline" size="icon" on:click={handleGoToAccount}>
					<Settings class="h-4 w-4" />
				</Button>
				<Button
					class="gap-x-2 bg-blue-700 text-neutral-50 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
				>
					<Plus class="h-4 w-4" />
					<span>New</span>
				</Button>
			</div>
		</div>
		<Alert.Root class="border-0 bg-emerald-900/30">
			<div class="flex items-center justify-between">
				<div class="flex gap-x-4">
					<p class="text-sm text-green-600">
						<b>Free Trial</b>
						<span class="ml-1 border-l border-green-600 pl-1">$5.00</span>
					</p>
					<p class="text-sm text-green-600">512 MB of RAM, 1 GB of Disk, and 2 vCPU</p>
				</div>
				<Button
					class="bg-blue-700 text-neutral-50 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
				>
					Choose a Plan
				</Button>
			</div>
		</Alert.Root>
	</div>
	<div class="mt-8 grid grid-cols-3 gap-4 border-t pt-4">
		<div
			class="flex h-full min-h-28 cursor-pointer flex-col justify-between rounded-lg bg-slate-800/50 p-4 hover:bg-slate-800/70"
		>
			<h5>Test project</h5>
			<span class="text-sm text-neutral-400">empty project</span>
		</div>
	</div>
</section>
