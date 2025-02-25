<script lang="ts">
	import {
		Code,
		Network,
		Cloud,
		Globe,
		EllipsisVertical,
		Pencil,
		Trash2Icon,
		Plus,
		CircleAlert
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Select from '$lib/components/ui/select';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import CircleIcon from './CircleIcon.svelte';
	import {
		createDomain,
		createPortMapping,
		deleteDomain,
		deletePortMapping,
		updateDomain,
		updatePortMapping,
		type CreateDomainRequestBody,
		type Domain,
		type GetServiceResponse,
		type PortMapping,
		type UpdateDomainRequestBody
	} from '../../../../api/services';
	import { selectedInstanceId } from '../../../../stores/instanceStore';
	import { useDomains, usePortMappings } from '../../../../queries/services';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import { Circle } from 'svelte-loading-spinners';
	import type { Selected } from 'bits-ui';

	export let service: GetServiceResponse;
	export let projectId: string;

	let domains: Domain[] = [];
	let isDomainAdding = false;
	let newDomainName = '';
	let newDomainEmail = '';
	let isTlsEnabled = true;
	let selectedDomain: Domain | null = null;

	let isEditingDomain = false;
	let updatedDomainName = '';
	let updatedDomainEmail: string | null = '';
	let updatedIsTlsEnabled = true;
	let editingDomain: Domain | null = null;

	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	const domainNameRegex =
		/^(((?!-))(xn--|_)?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9\-]{0,60}|[a-z0-9\-]{1,30}\.[a-z]{2,})$/;

	let portMappings: PortMapping[] = [];
	let isPortMappingAdding = false;
	let isEditingPortMapping = false;
	let newHostAddress = '0.0.0.0';
	let newHostPort: number | '' = '';
	let newContainerPort: number | '' = '';
	let newProtocol: Protocol = 'http';
	let selectedPortMapping: PortMapping | null = null;
	let editingPortMapping: PortMapping | null = null;

	type Protocol = 'http' | 'tcp' | 'udp';
	const protocols = ['http', 'tcp', 'udp'];
	let showModal = false;
	let isUpdating = false;

	const {
		service: { imageName, commandWithArguments }
	} = service;

	$: queryDomains = $selectedInstanceId
		? useDomains($selectedInstanceId, projectId, service.service.id)
		: null;

	$: {
		if ($queryDomains?.data) {
			domains = $queryDomains.data;
		}
	}

	$: isAddDomainDisabled = !!(
		(newDomainName && !newDomainEmail) ||
		(!newDomainName && newDomainEmail) ||
		(newDomainName && !domainNameRegex.test(newDomainName)) ||
		(newDomainEmail && !emailRegex.test(newDomainEmail)) ||
		(isTlsEnabled && !newDomainEmail) ||
		isUpdating
	);

	$: isUpdateDomainDisabled = !!(
		isUpdating ||
		!updatedDomainName ||
		(updatedIsTlsEnabled && !updatedDomainEmail) ||
		(updatedDomainEmail && !emailRegex.test(updatedDomainEmail)) ||
		(updatedDomainName && !domainNameRegex.test(updatedDomainName)) ||
		(updatedDomainName === editingDomain?.name &&
			updatedDomainEmail === editingDomain?.email &&
			updatedIsTlsEnabled === editingDomain?.isTlsEnabled)
	);

	$: queryPortMappings = $selectedInstanceId
		? usePortMappings($selectedInstanceId, projectId, service.service.id)
		: null;

	$: {
		if ($queryPortMappings?.data) {
			portMappings = $queryPortMappings.data;
		}
	}
	$: isAddPortMappingDisabled =
		Number(newHostPort) < 1 ||
		Number(newHostPort) > 65535 ||
		Number(newContainerPort) < 1 ||
		Number(newContainerPort) > 65535;

	function openDeleteDomainModal(domain: Domain) {
		selectedDomain = domain;
		showModal = true;
	}

	async function handleDeleteDomain() {
		if (!selectedDomain || !$selectedInstanceId) return;
		isUpdating = true;
		try {
			await deleteDomain($selectedInstanceId, projectId, service.service.id, selectedDomain.id);
			$queryDomains?.refetch();
			cancelDeleteDomain();
		} catch (error) {
			console.error('Failed to delete domain:', error);
		} finally {
			isUpdating = false;
		}
	}

	function cancelDeleteDomain() {
		showModal = false;
		selectedDomain = null;
	}

	async function handleAddDomain() {
		isUpdating = true;
		try {
			const requestBody: CreateDomainRequestBody = {
				domain:
					newDomainName && newDomainEmail
						? { name: newDomainName, email: newDomainEmail, isTlsEnabled }
						: { name: null, email: null, isTlsEnabled }
			};
			await createDomain($selectedInstanceId!, projectId, service.service.id, requestBody);
			$queryDomains?.refetch();
			cancelAddingDomain();
		} catch (error) {
			console.error('Failed to add domain:', error);
		} finally {
			isUpdating = false;
		}
	}

	function openEditDomainModal(domain: Domain) {
		isDomainAdding = false;
		isEditingDomain = true;
		editingDomain = { ...domain };
		updatedDomainName = domain.name;
		updatedDomainEmail = domain.email;
		updatedIsTlsEnabled = domain.isTlsEnabled;
	}

	async function handleUpdateDomain() {
		if (!editingDomain || !$selectedInstanceId) return;
		isUpdating = true;
		try {
			const requestBody: UpdateDomainRequestBody = { domain: {} };

			if (updatedDomainName !== editingDomain.name) {
				requestBody.domain.name = updatedDomainName;
			}
			if (updatedDomainEmail !== editingDomain.email) {
				requestBody.domain.email = updatedDomainEmail || null;
			}
			if (updatedIsTlsEnabled !== editingDomain.isTlsEnabled) {
				requestBody.domain.isTlsEnabled = updatedIsTlsEnabled;
			}

			await updateDomain(
				$selectedInstanceId,
				projectId,
				service.service.id,
				editingDomain.id,
				requestBody
			);

			$queryDomains?.refetch();
			cancelEditingDomain();
		} catch (error) {
			console.error('Failed to update domain:', error);
		} finally {
			isUpdating = false;
		}
	}

	function cancelEditingDomain() {
		isEditingDomain = false;
		editingDomain = null;
		updatedDomainName = '';
		updatedDomainEmail = '';
		updatedIsTlsEnabled = true;
	}

	function cancelAddingDomain() {
		isDomainAdding = false;
		newDomainName = '';
		newDomainEmail = '';
		isTlsEnabled = true;
	}

	function openDeletePortMappingModal(portMappingId: PortMapping) {
		selectedPortMapping = portMappingId;
		showModal = true;
	}

	async function handleDeletePortMapping() {
		if (!selectedPortMapping || !$selectedInstanceId) return;
		isUpdating = true;
		try {
			await deletePortMapping(
				$selectedInstanceId,
				projectId,
				service.service.id,
				selectedPortMapping.id
			);
			$queryPortMappings?.refetch();
			cancelDeletePortMapping();
		} catch (error) {
			console.error('Failed to delete port mapping:', error);
		} finally {
			isUpdating = false;
		}
	}

	function cancelDeletePortMapping() {
		showModal = false;
		selectedPortMapping = null;
	}

	async function handleAddPortMapping() {
		isUpdating = true;
		try {
			await createPortMapping($selectedInstanceId!, projectId, service.service.id, {
				portMapping: {
					hostAddress: newHostAddress,
					hostPort: Number(newHostPort),
					containerPort: Number(newContainerPort),
					protocol: newProtocol
				}
			});
			$queryPortMappings?.refetch();
			cancelAddingPortMapping();
		} catch (error) {
			console.error('Failed to add port mapping:', error);
		} finally {
			isUpdating = false;
		}
	}

	function openAddingPortMapping() {
		isPortMappingAdding = true;
		isEditingPortMapping = false;
		editingPortMapping = null;
		newHostAddress = '0.0.0.0';
		newHostPort = '';
		newContainerPort = '';
		newProtocol = 'http';
	}

	function cancelAddingPortMapping() {
		isPortMappingAdding = false;
		newHostAddress = '0.0.0.0';
		newHostPort = '';
		newContainerPort = '';
		newProtocol = 'http';
	}

	function handleSelectProtocol(selected: Selected<Protocol> | undefined) {
		if (selected) {
			newProtocol = selected.value;
		}
	}

	function openEditPortMappingModal(portMapping: PortMapping) {
		isEditingPortMapping = true;
		isPortMappingAdding = false;
		editingPortMapping = { ...portMapping };
		newProtocol = portMapping.protocol;
		newHostAddress = portMapping.hostAddress;
		newHostPort = portMapping.hostPort;
		newContainerPort = portMapping.containerPort;
		editingPortMapping = portMapping;
	}

	$: hasChanges =
		editingPortMapping &&
		(newHostAddress !== editingPortMapping?.hostAddress ||
			newHostPort !== editingPortMapping?.hostPort ||
			newContainerPort !== editingPortMapping?.containerPort ||
			newProtocol !== editingPortMapping?.protocol);

	async function handleSavePortMapping() {
		if (!editingPortMapping) return;
		isUpdating = true;

		try {
			await updatePortMapping(
				$selectedInstanceId!,
				projectId,
				service.service.id,
				editingPortMapping.id,
				{
					portMapping: {
						hostAddress: newHostAddress,
						hostPort: Number(newHostPort),
						containerPort: Number(newContainerPort),
						protocol: newProtocol
					}
				}
			);
			$queryPortMappings?.refetch();
			cancelEditingPortMapping();
		} catch (error) {
			console.error('Failed to save port mapping:', error);
		} finally {
			isUpdating = false;
		}
	}

	function cancelEditingPortMapping() {
		isPortMappingAdding = false;
		newProtocol = 'http';
		newHostAddress = '0.0.0.0';
		newHostPort = '';
		newContainerPort = '';
		editingPortMapping = null;
	}
</script>

<div class="flex flex-col gap-10 pt-4">
	<div class="flex flex-col gap-6">
		<div class="flex items-center gap-6 text-neutral-400">
			<CircleIcon icon={Code} />
			<h2 class="text-xl font-medium">Source</h2>
		</div>
		<div class="ml-16 flex flex-col gap-4 text-sm">
			<p class="text-neutral-400">Image Name</p>
			<div class="h-fit min-h-14 overflow-x-auto rounded-lg border p-5">{imageName}</div>
		</div>
	</div>
	<div class="flex flex-col gap-6">
		<div class="flex items-center gap-6 text-neutral-400">
			<CircleIcon icon={Network} />
			<h2 class="text-xl font-medium">Networking</h2>
		</div>
		{#each domains as domain}
			{#if editingDomain?.id === domain.id && isEditingDomain}
				<div class="ml-16 mr-6 flex gap-2">
					<div class="bg-accent flex w-full flex-col gap-3 overflow-x-auto rounded-lg border p-5">
						<div class="flex items-center gap-2">
							<input
								type="text"
								placeholder="Name"
								bind:value={updatedDomainName}
								class="flex h-9 w-full min-w-[200px] items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
							/>
							<input
								type="email"
								placeholder="Email"
								bind:value={updatedDomainEmail}
								class="flex h-9 w-full min-w-[200px] items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
							/>
						</div>
						<label class="ml-1 flex items-center gap-2">
							<input
								type="checkbox"
								bind:checked={updatedIsTlsEnabled}
								class="h-4 w-4 accent-[#853bce] opacity-70 checked:opacity-100"
							/>
							<p>Enable TLS</p>
						</label>
						<div
							class="mt-3 flex w-full flex-col items-end justify-between gap-4 sm:flex-row lg:flex-col xl:flex-row"
						>
							<p class="flex items-start gap-1 text-neutral-400">
								{#if updatedIsTlsEnabled}
									<CircleAlert class="max-h-w max-h-5 min-h-4 min-w-4" />
									<span>An email is required when TLS is enabled</span>
								{/if}
							</p>
							<div class="flex gap-2">
								<Button
									class="flex h-9 items-center gap-1 border bg-transparent text-sm text-white hover:bg-[#33323e]"
									on:click={cancelEditingDomain}
								>
									Cancel
								</Button>
								<Button
									class="flex h-9 w-[135px] items-center gap-1 bg-[#853bce] px-3 text-sm text-white hover:bg-[#A667E4]"
									on:click={handleUpdateDomain}
									disabled={isUpdateDomainDisabled}
								>
									{#if isUpdating}
										<Circle size="16" color="white" />
									{:else}
										Update Domain
									{/if}
								</Button>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="flex w-full gap-2">
					<div
						class="ml-16 flex h-fit min-h-14 w-full items-center gap-8 overflow-x-auto text-nowrap rounded-lg border p-5 text-sm"
					>
						<div class="flex flex-row items-center gap-2 text-neutral-400">
							<Globe class="h-4 w-4" />
							<span>Domain:</span>
							<span class="cursor-pointer text-white hover:underline">https://{domain.name}</span>
						</div>
						{#if domain.isTlsEnabled !== undefined}
							<div>
								<span class="mr-2 text-neutral-400">TLS:</span>
								<span>{domain.isTlsEnabled ? 'Enabled' : 'Disabled'}</span>
							</div>
						{/if}
					</div>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="outline-none">
							<EllipsisVertical class="h-4 w-4 text-neutral-400 group-hover/item:text-white" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item
								class="flex items-center gap-2 text-base"
								on:click={() => openEditDomainModal(domain)}
							>
								<Pencil class="h-4 w-4" />
								Edit
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="flex items-center gap-2 text-base"
								style="color: #b62d2b;"
								on:click={() => openDeleteDomainModal(domain)}
							>
								<Trash2Icon class="h-4 w-4" />
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{/if}
		{/each}
		{#each portMappings as portMapping}
			{#if editingPortMapping === portMapping && isEditingPortMapping}
				<div class="flex w-full">
					<div class="bg-accent ml-16 mr-6 flex w-full flex-col gap-2 rounded-lg border p-5">
						<div class="flex w-full flex-wrap items-center gap-x-8 gap-y-4 text-sm">
							<div class="flex items-center gap-2">
								<span class="text-neutral-400">Protocol:</span>
								<Select.Root
									selected={{ value: newProtocol }}
									onSelectedChange={handleSelectProtocol}
								>
									<Select.Trigger
										class="bg-accent h-9 w-[150px] rounded-lg border border-neutral-500 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
										>{newProtocol}</Select.Trigger
									>
									<Select.Content class="bg-accent">
										{#each protocols as protocol}
											<Select.Item
												value={protocol}
												class="bg-accent h-9 text-sm hover:bg-[#33323e] data-[highlighted]:bg-[#33323e]"
												aria-selected={protocol === newProtocol}
											>
												{protocol}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
							<div class="flex flex-1 items-center gap-2">
								<span class="text-neutral-400">Host:</span>
								<input
									type="text"
									placeholder="Address"
									bind:value={newHostAddress}
									class="flex h-9 min-w-[150px] max-w-[150px] items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
								/>
								<span>➔</span>
								<input
									type="number"
									placeholder="Port"
									bind:value={newHostPort}
									class="flex h-9 min-w-[150px] max-w-[150px] items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm [appearance:textfield] hover:border-neutral-400 focus:border-[#853bce] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
							</div>
							<div class="flex flex-1 items-center gap-2">
								<span class="whitespace-nowrap text-neutral-400">Container Port:</span>
								<input
									type="number"
									placeholder="Port"
									bind:value={newContainerPort}
									class="flex h-9 min-w-[150px] max-w-[150px] items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm [appearance:textfield] hover:border-neutral-400 focus:border-[#853bce] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
							</div>
						</div>
						<div class="mt-3 flex flex-1 items-end justify-end gap-2">
							<div class="flex gap-2">
								<Button
									class="flex h-9 items-center gap-1 border bg-transparent text-sm text-white hover:bg-[#33323e]"
									on:click={cancelEditingPortMapping}
								>
									Cancel
								</Button>
								<Button
									class="flex h-9 w-[174px] items-center gap-1 bg-[#853bce] px-3 text-sm text-white hover:bg-[#A667E4]"
									on:click={handleSavePortMapping}
									disabled={isAddPortMappingDisabled || isUpdating || !hasChanges}
								>
									{#if isUpdating}
										<Circle size="16" color="white" />
									{:else}
										Update Port Mapping
									{/if}
								</Button>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="flex w-full gap-2">
					<div
						class="ml-16 flex h-fit min-h-14 w-full items-center gap-8 overflow-x-auto text-nowrap rounded-lg border p-5 text-sm"
					>
						<div>
							<span class="mr-2 text-neutral-400">Protocol:</span>
							<span>{portMapping.protocol}</span>
						</div>

						<div>
							<span class="mr-2 text-neutral-400">Host:</span>
							<span>{portMapping.hostAddress}:{portMapping.hostPort}</span>
						</div>
						➔
						<div>
							<span class="mr-2 text-neutral-400">Container Port:</span>
							<span>{portMapping.containerPort}</span>
						</div>
					</div>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="outline-none">
							<EllipsisVertical class="h-4 w-4 text-neutral-400 group-hover/item:text-white" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item
								class="flex items-center gap-2 text-base"
								on:click={() => openEditPortMappingModal(portMapping)}
							>
								<Pencil class="h-4 w-4" />
								Edit
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="flex items-center gap-2 text-base"
								style="color: #b62d2b;"
								on:click={() => openDeletePortMappingModal(portMapping)}
							>
								<Trash2Icon class="h-4 w-4" />
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{/if}
		{/each}
		<div class="ml-16 mr-6 flex gap-2">
			{#if isDomainAdding}
				<div class="bg-accent flex w-full flex-col gap-3 overflow-x-auto rounded-lg border p-5">
					<div class="flex items-center gap-2">
						<input
							type="text"
							placeholder="Name"
							bind:value={newDomainName}
							class="flex h-9 w-full min-w-[200px] items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
						/>
						<input
							type="email"
							placeholder="Email"
							bind:value={newDomainEmail}
							class="flex h-9 w-full min-w-[200px] items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
						/>
					</div>
					<label class="ml-1 flex items-center gap-2">
						<input
							type="checkbox"
							bind:checked={isTlsEnabled}
							class="h-4 w-4 accent-[#853bce] opacity-70 checked:opacity-100"
						/>
						<p>Enable TLS</p>
					</label>
					<div
						class="mt-3 flex w-full flex-col items-end justify-between gap-4 sm:flex-row lg:flex-col xl:flex-row"
					>
						<p class="flex items-start gap-1 text-neutral-400">
							<CircleAlert class="max-h-w max-h-5 min-h-4 min-w-4" />
							{#if isTlsEnabled}
								<span>An email is required when TLS is enabled</span>
							{:else}
								<span>Leaving name and email empty will generate a temporary domain</span>
							{/if}
						</p>
						<div class="flex gap-2">
							<Button
								class="flex h-9 items-center gap-1 border bg-transparent text-sm text-white hover:bg-[#33323e]"
								on:click={cancelAddingDomain}
							>
								Cancel
							</Button>
							<Button
								class="flex h-9 w-[112px] items-center gap-1 bg-[#853bce] px-3 text-sm text-white hover:bg-[#A667E4]"
								on:click={handleAddDomain}
								disabled={isAddDomainDisabled}
							>
								{#if isUpdating}
									<Circle size="16" color="white" />
								{:else}
									Add Domain
								{/if}
							</Button>
						</div>
					</div>
				</div>
			{:else if isPortMappingAdding}
				<div class="bg-accent flex w-full flex-col gap-2 overflow-x-auto rounded-lg border p-5">
					<div class="flex w-full flex-wrap items-center gap-x-8 gap-y-4 text-sm">
						<div class="flex items-center gap-2">
							<span class="text-neutral-400">Protocol:</span>
							<Select.Root
								selected={{ value: newProtocol }}
								onSelectedChange={handleSelectProtocol}
							>
								<Select.Trigger
									class="bg-accent h-9 w-[150px] rounded-lg border border-neutral-500 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
									>{newProtocol}</Select.Trigger
								>
								<Select.Content class="bg-accent">
									{#each protocols as protocol}
										<Select.Item
											value={protocol}
											class="bg-accent h-9 text-sm hover:bg-[#33323e] data-[highlighted]:bg-[#33323e]"
											aria-selected={protocol === newProtocol}
										>
											{protocol}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="flex flex-1 items-center gap-2">
							<span class="text-neutral-400">Host:</span>
							<input
								type="text"
								placeholder="Address"
								bind:value={newHostAddress}
								class="flex h-9 min-w-[150px] max-w-[150px] items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm hover:border-neutral-400 focus:border-[#853bce] focus:outline-none"
							/>
							<span>:</span>
							<input
								type="number"
								placeholder="Port"
								bind:value={newHostPort}
								class="flex h-9 min-w-[150px] max-w-[150px] items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm [appearance:textfield] hover:border-neutral-400 focus:border-[#853bce] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
							/>
						</div>
						<div class="flex flex-1 items-center gap-2">
							<span class="whitespace-nowrap text-neutral-400">Container Port:</span>
							<input
								type="number"
								placeholder="Port"
								bind:value={newContainerPort}
								class="flex h-9 min-w-[150px] max-w-[150px] items-center overflow-hidden rounded-lg border border-neutral-500 bg-transparent px-6 text-sm [appearance:textfield] hover:border-neutral-400 focus:border-[#853bce] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
							/>
						</div>
					</div>
					<div class="mt-3 flex flex-1 items-end justify-end gap-2">
						<div class="flex gap-2">
							<Button
								class="flex h-9 items-center gap-1 border bg-transparent text-sm text-white hover:bg-[#33323e]"
								on:click={cancelAddingPortMapping}
							>
								Cancel
							</Button>
							<Button
								class="flex h-9 w-[150px] items-center gap-1 bg-[#853bce] px-3 text-sm text-white hover:bg-[#A667E4]"
								on:click={handleAddPortMapping}
								disabled={isAddPortMappingDisabled || isUpdating}
							>
								{#if isUpdating}
									<Circle size="16" color="white" />
								{:else}
									Add Port Mapping
								{/if}
							</Button>
						</div>
					</div>
				</div>
			{:else}
				<Button
					class="hover:bg-accent flex h-9 items-center gap-1 border border-[#853bce] bg-transparent px-3 text-sm font-normal text-[#A667E4] hover:border-[#A667E4] hover:text-[#A667E4]"
					on:click={() => {
						isEditingDomain = false;
						isDomainAdding = true;
					}}
				>
					<Plus class="h-4 w-4" /> New Domain</Button
				>
				<Button
					class="hover:bg-accent flex h-9 items-center gap-1 border border-[#853bce] bg-transparent px-3 text-sm font-normal text-[#A667E4] hover:border-[#A667E4] hover:text-[#A667E4]"
					on:click={openAddingPortMapping}><Plus class="h-4 w-4" /> New Port Mapping</Button
				>{/if}
		</div>
	</div>
	<div class="flex flex-col gap-6">
		<div class="flex items-center gap-6 text-neutral-400">
			<CircleIcon icon={Cloud} />
			<h2 class="text-xl font-medium">Deploy</h2>
		</div>
		<div class="ml-16 flex flex-col gap-4 overflow-x-auto text-nowrap text-sm">
			<div class="flex gap-4">
				<p class="text-neutral-400">Restart Policy:</p>
				<p>unless-stopped</p>
			</div>
			{#if commandWithArguments}
				<p class="text-neutral-400">Custom Start Command</p>
				<div class="h-fit min-h-14 rounded-lg border p-5">{commandWithArguments}</div>
			{/if}
		</div>
	</div>
	{#if showModal && selectedDomain}
		<DeleteModal
			type="domain"
			name={selectedDomain.name}
			onDelete={handleDeleteDomain}
			onCancel={cancelDeleteDomain}
			isLoading={isUpdating}
		/>
	{/if}
	{#if showModal && selectedPortMapping}
		<DeleteModal
			type="port mapping"
			name={`${selectedPortMapping.hostAddress}:${selectedPortMapping.hostPort} ➔ ${selectedPortMapping.containerPort}`}
			onDelete={handleDeletePortMapping}
			onCancel={cancelDeletePortMapping}
			isLoading={isUpdating}
		/>
	{/if}
</div>
