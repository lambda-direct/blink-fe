<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import { User, LogOut, SquarePlus, ChartNoAxesGantt } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import github from '$lib/images/github.svg';
	import DropdownMenuSeparator from '$lib/components/ui/dropdown-menu/dropdown-menu-separator.svelte';

	function handleGoToAccount() {
		goto('account');
	}

	$: currentPath = $page.url.pathname;
</script>

<header class="mx-auto grid items-center py-4">
	<nav class="w-full border-b">
		<div class="mx-auto flex max-w-screen-lg items-center justify-end">
			<a
				href="/"
				class="relative h-10 px-4 py-2 text-sm font-medium transition-colors hover:text-white {currentPath ===
				'/'
					? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
					: 'text-neutral-400'}"
			>
				Dashboard
			</a>
			<a
				href="/statistics"
				class="relative h-10 px-4 py-2 text-sm font-medium transition-colors hover:text-white {currentPath ===
				'/statistics'
					? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
					: 'text-neutral-400'}"
			>
				Statistics
			</a>
			<a
				href="/logs"
				class="relative h-10 px-4 py-2 text-sm font-medium transition-colors hover:text-white {currentPath ===
				'/logs'
					? 'after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-white after:content-[""]'
					: 'text-neutral-400'}"
			>
				Logs
			</a>
		</div>
	</nav>
</header>
