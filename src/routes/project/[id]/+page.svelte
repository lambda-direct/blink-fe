<script context="module" lang="ts">
	export type Tab = 'settings' | 'metrics' | 'variables' | 'logs' | 'mounts';
	export type ChartColors = { [statusCode: string]: string };
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
	import VariablesTab from './components/VariablesTab.svelte';
	import LogsTab from './components/LogsTab.svelte';
	import MetricsTab from './components/MetricsTab.svelte';
	import MountTab from './components/MountsTab.svelte';
	import MountsTab from './components/MountsTab.svelte';

	let services: GetServicesResponse['services'] = [];
	let service: GetServiceResponse | null = null;
	let selectedServiceId: string | null = null;
	let selectedMountId: string | null = null;
	let projectId = $page.params.id;
	let activeTab: Tab = 'settings';

	$: queryServices = useServices(projectId);
	$: queryServiceDetails = selectedServiceId ? useService(projectId, selectedServiceId) : null;
	$: activeTab = selectedMountId ? 'mounts' : 'settings';

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

	function openServiceDetails(serviceId: string, mountId: string | null = null) {
		selectedServiceId = serviceId;
		selectedMountId = mountId;
		activeTab = mountId ? 'mounts' : 'settings';
	}

	function closeServiceDetails() {
		selectedServiceId = null;
		selectedMountId = null;
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
				{projectId}
				serviceId={service.id}
				onClick={(serviceId, mountId) => openServiceDetails(serviceId, mountId)}
				selected={service.id === selectedServiceId}
			/>
		{/each}
	</div>
	{#if selectedServiceId && service}
		<div
			class="bg-card absolute right-0 top-0 flex h-full min-h-[90vh] w-full flex-col overflow-hidden rounded-lg border transition-transform duration-300 ease-out lg:w-1/2"
		>
			<div class="flex flex-col">
				<div class="mb-5 flex w-full items-center justify-between px-12 pt-12">
					<span class="overflow-hidden text-ellipsis text-nowrap text-3xl">
						{service.service.name}</span
					>
					<button
						class="hover:bg-accent cursor-pointer rounded-lg"
						on:click={closeServiceDetails}
						aria-label="Close Panel"
					>
						<XIcon class="m-2 h-5 w-5" />
					</button>
				</div>
				{#if selectedServiceId}
					<TabNav
						{activeTab}
						onTabSelect={handleTabSelect}
						hasMounts={service.bindMounts && service.bindMounts.length > 0}
					>
						{#if activeTab === 'settings'}
							{#key service.service.id}
								<SettingsTab {service} />
							{/key}
						{:else if activeTab === 'variables'}
							{#key service.service.id}
								<VariablesTab variables={service.environmentVariables} />
							{/key}
						{:else if activeTab === 'metrics'}
							{#key service.service.id}
								<MetricsTab {projectId} serviceId={selectedServiceId} />
							{/key}
						{:else if activeTab === 'logs'}
							{#key service.service.id}
								<LogsTab {projectId} serviceId={selectedServiceId} />
							{/key}
						{:else if activeTab === 'mounts'}
							{#key service.service.id}
								<MountsTab mounts={service.bindMounts} />
							{/key}
						{/if}
					</TabNav>
				{/if}
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
