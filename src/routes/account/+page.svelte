<script>
	import { goto } from '$app/navigation';

	import {
		ChevronDown,
		SquarePlus,
		Settings,
		Plus,
		Flag,
		Lock,
		Gift,
		KeyRound,
		ChartNoAxesColumn,
		FileStack,
		CreditCard,
		DollarSign,
		LayoutTemplate
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Alert from '$lib/components/ui/alert';

	function handleGoToAccount() {
		goto('account');
	}
</script>

<div class="mb-24 mt-12 block space-y-4 md:flex md:space-x-12 md:space-y-0">
	<div class="flex w-[240px] flex-col items-start space-y-4">
		<aside class="md:w-sidebar md:min-w-sidebar h-max w-full pt-0 md:sticky md:top-4 md:!w-auto">
			<div class="flex flex-col">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							class="mb-4 h-auto gap-x-2 text-neutral-50"
							variant="ghost"
						>
							<Avatar.Root class="h-6 w-6">
								<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
								<Avatar.Fallback>CN</Avatar.Fallback>
							</Avatar.Root>
							<div class="flex flex-col items-start gap-y-1">
								<span class="text-lg leading-none">John Doe</span>
								<span class="text-xs leading-none text-neutral-400">Personal Account</span>
							</div>
							<ChevronDown class="h-4 w-4" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" align="end">
						<DropdownMenu.Item class="flex items-center gap-x-2">
							<SquarePlus class="h-4 w-4" />
							Create Team
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				<Button
					class="group justify-start gap-x-3 text-neutral-50 transition delay-150 ease-in-out"
					variant="ghost"
				>
					<Settings
						class="h-4 w-4 transition delay-150 ease-in-out group-hover:rotate-12 group-hover:stroke-blue-500"
					/>
					<span>General</span>
				</Button>
				<Button class="group justify-start gap-x-3 text-neutral-50" variant="ghost">
					<FileStack
						class="h-4 w-4 transition delay-150 ease-in-out group-hover:rotate-12 group-hover:stroke-blue-500"
					/>
					<span>Plans</span>
				</Button>
				<Button class="group justify-start gap-x-3 text-neutral-50" variant="ghost">
					<ChartNoAxesColumn
						class="h-4 w-4 transition delay-150 ease-in-out group-hover:rotate-12 group-hover:stroke-blue-500"
					/>
					<span>Usage</span>
				</Button>
				<Button class="group justify-start gap-x-3 text-neutral-50" variant="ghost">
					<CreditCard
						class="h-4 w-4 transition delay-150 ease-in-out group-hover:rotate-12 group-hover:stroke-blue-500"
					/>
					<span>Billing</span>
				</Button>
				<Button class="group justify-start gap-x-3 text-neutral-50" variant="ghost">
					<Flag
						class="h-4 w-4 transition delay-150 ease-in-out group-hover:rotate-12 group-hover:stroke-blue-500"
					/>
					<span>Feature Flags</span>
				</Button>
				<Button class="group justify-start gap-x-3 text-neutral-50" variant="ghost">
					<KeyRound
						class="h-4 w-4 transition delay-150 ease-in-out group-hover:rotate-12 group-hover:stroke-blue-500"
					/>
					<span>Tokens</span>
				</Button>
				<Button class="group justify-start gap-x-3 text-neutral-50" variant="ghost">
					<Lock
						class="h-4 w-4 transition delay-150 ease-in-out group-hover:rotate-12 group-hover:stroke-blue-500"
					/>
					<span>Security</span>
				</Button>
				<Button class="group justify-start gap-x-3 text-neutral-50" variant="ghost">
					<Gift
						class="h-4 w-4 transition delay-150 ease-in-out group-hover:rotate-12 group-hover:stroke-blue-500"
					/>
					<span>Referrals</span>
				</Button>
				<Button class="group justify-start gap-x-3 text-neutral-50" variant="ghost">
					<DollarSign
						class="h-4 w-4 transition delay-150 ease-in-out group-hover:rotate-12 group-hover:stroke-blue-500"
					/>
					<span>Earnings</span>
				</Button>
				<Button class="group justify-start gap-x-3 text-neutral-50" variant="ghost">
					<LayoutTemplate
						class="h-4 w-4 transition delay-150 ease-in-out group-hover:rotate-12 group-hover:stroke-blue-500"
					/>
					<span>Templates</span>
				</Button>
			</div>
		</aside>
	</div>
	<div class="min-h-lg flex w-full min-w-0 flex-col items-center">
		<div class="flex w-full flex-col space-y-12">
			<h3>General Settings</h3>
			<hr class="my-4 w-full border-t border-secondary" />
			<div class="flex w-full flex-col space-y-12">
				<div class="flex flex-col space-y-8">
					<p class="text-h4 font-semibold">Account Information</p>
					<form class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div class="flex w-full flex-col gap-y-2">
							<Label class="text-neutral-400">Name</Label>
							<Input />
						</div>
						<div class="flex w-full flex-col gap-y-2">
							<Label class="text-neutral-400">Email</Label>
							<Input />
						</div>
						<div class="flex w-full flex-col gap-y-2">
							<Label class="text-neutral-400">Username</Label>
							<Input />
						</div>
						<div class="flex w-full flex-col gap-y-2">
							<Label class="text-neutral-400">Avatar URL</Label>
							<Input />
						</div>
						<Button
							class="flex max-w-max bg-blue-700 text-neutral-50 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
							>Update Info</Button
						>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
