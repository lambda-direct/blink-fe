<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import Header from './Header.svelte';
	import { useAccessToken } from '../queries/auth';
	import '../app.css';

	let isLoading = true;
	let isAuthenticated = false;

	if (typeof window !== 'undefined') {
		isAuthenticated = !!localStorage.getItem('accessToken');
	}

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				enabled: browser
			}
		}
	});

	onMount(async () => {
		if (!browser) return;
		try {
			const urlParams = new URLSearchParams(window.location.search);
			const code = urlParams.get('code');
			const tokenFromUrl = urlParams.get('token');
			const accessToken = localStorage.getItem('accessToken');

			if (tokenFromUrl && code) {
				const { accessToken, refreshToken } = await useAccessToken(tokenFromUrl, code);
				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('refreshToken', refreshToken);
				window.location.href = '/dashboard';
			} else if (!accessToken) {
				goto('/');
			}
		} catch (error) {
			console.error('Error:', error);
			goto('/');
		} finally {
			isLoading = false;
		}
	});
</script>

<QueryClientProvider client={queryClient}>
	<div class="app font-poppins min-h-screen text-neutral-50">
		<Header />
		{#if !isLoading}
			<main class="{isAuthenticated ? 'h-[calc(100vh-80px-17px*2)] lg:h-[calc(100vh-40px-17px*2)]' : ''} overflow-hidden">
				<slot></slot>
			</main>
		{/if}
	</div>
</QueryClientProvider>
