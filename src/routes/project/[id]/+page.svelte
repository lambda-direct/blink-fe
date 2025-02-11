<script context="module" lang="ts">
	export type Tab = 'settings' | 'metrics' | 'variables' | 'logs' | 'mounts';
	export type ChartColors = { [statusCode: string]: string };
</script>

<script lang="ts">
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import type { GetServiceResponse, GetServicesResponse } from '../../../api/services';
	import { page } from '$app/stores';
	import { useService, useServices } from '../../../queries/services';
	import { Plus, XIcon } from 'lucide-svelte';
	import TabNav from './components/TabNav.svelte';
	import SettingsTab from './components/SettingsTab.svelte';
	import VariablesTab from './components/VariablesTab.svelte';
	import LogsTab from './components/LogsTab.svelte';
	import MetricsTab from './components/MetricsTab.svelte';
	import MountsTab from './components/MountsTab.svelte';
	import { selectedInstanceId } from '../../../stores/instanceStore';
	import ErrorPage from '$lib/components/ErrorPage.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { Circle } from 'svelte-loading-spinners';

	let services: GetServicesResponse['services'] = [];
	let service: GetServiceResponse | null = null;
	let selectedServiceId: string | null = null;
	let selectedMountId: string | null = null;
	let activeTab: Tab = 'settings';

	let hasError: boolean = false;
	let isLoading: boolean = false;
	let errorStatus: number;
	let errorMessage: string;

	$: projectId = $page.params.id;

	$: {
		if (projectId) {
			selectedServiceId = null;
			selectedMountId = null;
			activeTab = 'settings';
		}
	}

	$: queryServices = $selectedInstanceId ? useServices($selectedInstanceId, projectId) : null;
	$: {
		if ($queryServices) {
			isLoading = $queryServices.isFetching;
			if ($queryServices?.isError) {
				services = [];
				hasError = true;
				errorStatus = 404;
				errorMessage = 'Project not found';
			} else if ($queryServices?.data) {
				services = $queryServices.data;
			}
		}
	}

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

	function handleEscapeKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeServiceDetails();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleEscapeKey);
	});

	onDestroy(() => {
		document.removeEventListener('keydown', handleEscapeKey);
	});
</script>

{#if hasError}
	<ErrorPage status={errorStatus} message={errorMessage} />
{:else if isLoading}
	<div class="flex h-full items-center justify-center pb-4">
		<Circle size="30" color="#1F2937" />
	</div>
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
			<button
				class="h-full min-h-36 w-72 cursor-pointer overflow-hidden rounded-lg border border-dashed border-neutral-400 p-4 text-neutral-400 hover:border-white hover:text-white"
				type="button"
				aria-label={`Create new project`}
			>
				<div class="flex w-full items-center justify-center gap-2 pr-4">
					<Plus class="h-4 w-4" />
					<h5>Add a Service</h5>
				</div>
			</button>
		</div>
		{#if selectedServiceId && service}
			<div
				class="bg-card fixed right-0 top-[114px] flex h-[calc(100%-91px)] w-full flex-col overflow-hidden rounded-lg border transition-transform duration-300 ease-out lg:top-[74px] lg:w-1/2"
			>
				<div class="flex h-full flex-col">
					<div class="mb-5 flex w-full items-center justify-between px-6 pt-12 md:px-12">
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
						<TabNav {activeTab} onTabSelect={handleTabSelect}>
							{#if activeTab === 'settings'}
								{#key service.service.id}
									<SettingsTab {projectId} {service} />
								{/key}
							{:else if activeTab === 'variables'}
								{#key service.service.id}
									<VariablesTab {projectId} serviceId={service.service.id} />
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
									<MountsTab
										{projectId}
										serviceId={selectedServiceId}
										on:refreshService={() => $queryServiceDetails?.refetch()}
									/>
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
