<script context="module" lang="ts">
	export type Tab = 'settings' | 'metrics' | 'variables' | 'logs' | 'mounts';
	export type ChartColors = { [statusCode: string]: string };
</script>

<script lang="ts">
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
	import MountsTab from './components/MountsTab.svelte';
	import { selectedInstanceId } from '../../../stores/instanceStore';
	import ErrorPage from '$lib/components/ErrorPage.svelte';

	let services: GetServicesResponse['services'] = [];
	let service: GetServiceResponse | null = null;
	let selectedServiceId: string | null = null;
	let selectedMountId: string | null = null;
	let projectId = $page.params.id;
	let activeTab: Tab = 'settings';

	let hasError: boolean = false;
	let errorStatus: number = 500;
	let errorMessage: string = 'An unexpected error occurred.';

	$: queryServices = $selectedInstanceId ? useServices($selectedInstanceId, projectId) : null;
	$: queryServiceDetails =
		$selectedInstanceId && selectedServiceId
			? useService($selectedInstanceId, projectId, selectedServiceId)
			: null;
	$: activeTab = selectedMountId ? 'mounts' : 'settings';

	$: {
		if ($queryServiceDetails?.data) {
			service = $queryServiceDetails.data;
		}
	}

	$: {
		if ($queryServices?.isError) {
			services = [];
			hasError = true;
			errorStatus = 404;
			errorMessage = 'Project not found';
		} else if ($queryServices?.data) {
			services = $queryServices.data;
			if (services.length === 0) {
				hasError = true;
				errorStatus = 404;
				errorMessage = 'No services found for this project';
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

{#if hasError}
	<ErrorPage status={errorStatus} message={errorMessage} />
{:else}
	<div class="relative flex h-full items-start justify-center overflow-y-auto pb-4">
		<div
			class="my-auto flex max-w-2xl flex-grow flex-wrap justify-center gap-10 transition-transform duration-300 ease-out"
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
				class="bg-card fixed right-0 top-[114px] flex h-[calc(100%-91px)] w-full flex-col overflow-hidden rounded-lg border transition-transform duration-300 ease-out lg:top-[74px] lg:w-1/2"
			>
				<div class="flex h-full flex-col">
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
{/if}

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
