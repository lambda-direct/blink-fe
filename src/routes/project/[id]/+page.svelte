<script context="module" lang="ts">
	export type Tab = 'settings' | 'metrics' | 'variables' | 'logs';
</script>

<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { applyAction } from '$app/forms';
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import type { GetServiceResponse, GetServicesResponse } from '../../../api/services';
	import { page } from '$app/stores';
	import { useService, useServices } from '../../../queries/services';
	import { XIcon } from 'lucide-svelte';
	import TabNav from './components/TabNav.svelte';
	import SettingsTab from './components/SettingsTab.svelte';

	let services: GetServicesResponse['services'] = [];
	let service: GetServiceResponse | null = null;
	let selectedServiceId: string | null = null;
	let projectId = $page.params.id;
	let activeTab: Tab = 'settings';


	$: queryServices = useServices(projectId);
	$: queryServiceDetails = selectedServiceId ? useService(projectId, selectedServiceId) : null;

	$: {
		if ($queryServiceDetails?.data) {
			service = $queryServiceDetails.data;
		}
	}

	$: {
		if ($queryServices.isError) {
			// applyAction({ type: 'error', error: { status: 400, message: 'Failed to load services' } });
			console.log('error');
		} else if ($queryServices.data) {
			services = $queryServices.data;

			if (services.length === 0) {
				// applyAction({
				// 	type: 'error',
				// 	error: { status: 404, message: 'No services found for this project.' }
				// });
				console.log('zero');
			}
		}
	}

	function handleTabSelect(tab: Tab) {
		activeTab = tab;
	}

	function openServiceDetails(serviceId: string) {
		selectedServiceId = serviceId;
	}

	function closeServiceDetails() {
		selectedServiceId = null;
	}
</script>

<div class="relative flex min-h-[90vh] items-center justify-center">
	<div
		class="dynamic-transform flex max-w-2xl flex-1 flex-wrap justify-center gap-10 transition-transform duration-300 ease-out"
		class:max-[1344px]:flex-col={selectedServiceId}
		style={selectedServiceId ? `transform: translateX(var(--transform-x, 0))` : ''}
	>
		{#each services as service}
			<ServiceCard
				{service}
				onClick={() => openServiceDetails(service.id)}
				selected={service.id === selectedServiceId}
			/>
		{/each}
	</div>
	{#if selectedServiceId && service}
		<div
			class="bg-card absolute right-0 top-0 flex h-full w-full flex-col overflow-hidden overflow-y-auto rounded-lg border transition-transform duration-300 ease-out lg:w-1/2"
		>
			<div class="flex flex-col">
				<div class="mb-5 flex w-full items-center justify-between px-12 pt-12">
					<span class="overflow-hidden text-ellipsis text-nowrap text-3xl"
						>{service.service.name}</span
					>
					<button
						class="hover:bg-accent cursor-pointer rounded-lg"
						on:click={closeServiceDetails}
						aria-label="Close Panel"
					>
						<XIcon class="m-2 h-5 w-5" />
					</button>
				</div>
				<TabNav {activeTab} onTabSelect={handleTabSelect}>
					{#if activeTab === 'settings'}
						{#key service.service.id}
							<SettingsTab {service} />
						{/key}
					{/if}
				</TabNav>
			</div>
		</div>
	{/if}
</div>

<style>
	:root {
		--transform-x: 0%;
	}

	@media (min-width: 1344px) and (max-width: 1799px) {
		:root {
			--transform-x: -50%;
		}
	}

	@media (min-width: 1800px) {
		:root {
			--transform-x: -75%;
		}
	}
</style>
