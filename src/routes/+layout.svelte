<script>
	import { browser } from '$app/environment';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	import Header from './Header.svelte';

	import '../app.css';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				enabled: browser
			}
		}
	});
</script>

<QueryClientProvider client={queryClient}>
	<div class="app font-poppins min-h-screen text-neutral-50">
		<Header />
		<main class="mx-auto max-w-screen-lg">
			<slot></slot>
		</main>
	</div>
</QueryClientProvider>
