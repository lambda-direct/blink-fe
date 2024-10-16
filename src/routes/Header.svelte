<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import { User, LogOut, SquarePlus, ChartNoAxesGantt } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import logo from '$lib/images/svelte-logo.svg';
	import github from '$lib/images/github.svg';
	import DropdownMenuSeparator from '$lib/components/ui/dropdown-menu/dropdown-menu-separator.svelte';

	function handleGoToAccount() {
		goto('account');
	}
</script>

<header class="mx-auto grid max-w-screen-lg grid-flow-col items-center py-4 lg:auto-cols-fr">
	<div class="flex h-6 w-6 items-center">
		<a href="/">
			<img src={logo} alt="SvelteKit" />
		</a>
	</div>

	<nav class="ml-auto flex items-center space-x-6">
		<div class="flex">
			<!-- <Button class="text-neutral-400" variant="link">Help</Button> -->
			<a
				href="/statistics"
				class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-neutral-400 underline-offset-4 ring-offset-background transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			>
				Statistics
			</a>
		</div>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Avatar.Root>
					<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
					<Avatar.Fallback>CN</Avatar.Fallback>
				</Avatar.Root>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56" align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item class="flex items-center gap-x-2" on:click={handleGoToAccount}>
						<User class="h-4 w-4" />
						Account Settings
					</DropdownMenu.Item>
					<DropdownMenu.Item class="flex items-center gap-x-2">
						<ChartNoAxesGantt class="h-4 w-4" />
						Project Usage
					</DropdownMenu.Item>
					<DropdownMenu.Item class="flex items-center gap-x-2">
						<SquarePlus class="h-4 w-4" />
						Create Team
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.DropdownMenuSeparator />
				<DropdownMenu.Item class="flex items-center gap-x-2">
					<LogOut class="h-4 w-4" />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</nav>
</header>
