import { createMutation, createQuery } from '@tanstack/svelte-query';
import {
	getServices,
	getService,
	getEnvironmentVariables,
	getEnvironmentVariable,
	type EnvironmentVariablesRequestBody,
	createEnvironmentVariables
} from '../../api/services';

export const useServices = (instanceId: string, projectId: string) => {
	return createQuery({
		queryKey: ['services', instanceId, projectId],
		queryFn: async () => {
			const response = await getServices(instanceId, projectId);
			return response.data.services;
		},
		enabled: !!instanceId,
		retry: false
	});
};

export const useService = (instanceId: string, projectId: string, serviceId: string) => {
	return createQuery({
		queryKey: ['service', instanceId, projectId, serviceId],
		queryFn: async () => {
			const response = await getService(instanceId, projectId, serviceId);
			return response.data;
		},
		enabled: !!instanceId,
		retry: false
	});
};

export const useEnvironmentVariable = (
	instanceId: string,
	projectId: string,
	serviceId: string,
	environmentVariableId: string
) => {
	return createQuery({
		queryKey: ['environmentVariable', instanceId, projectId, serviceId, environmentVariableId],
		queryFn: async () => {
			const response = await getEnvironmentVariable(
				instanceId,
				projectId,
				serviceId,
				environmentVariableId
			);
			return response.data.environmentVariable;
		},
		enabled: !!instanceId && !!projectId,
		retry: false
	});
};

export const useEnvironmentVariables = (
	instanceId: string,
	projectId: string,
	serviceId: string
) => {
	return createQuery({
		queryKey: ['environmentVariables', instanceId, projectId, serviceId],
		queryFn: async () => {
			const response = await getEnvironmentVariables(instanceId, projectId, serviceId);
			return response.data.environmentVariables;
		},
		enabled: !!instanceId && !!projectId,
		retry: false
	});
};

export const useAddEnvironmentVariable = (
	instanceId: string,
	projectId: string,
	serviceId: string
) => {
	return createMutation({
		mutationFn: async ({ name, value }: { name: string; value: string }) => {
			const requestBody: EnvironmentVariablesRequestBody = {
				environmentVariables: [{ name, value }]
			};
			const response = await createEnvironmentVariables(
				instanceId,
				projectId,
				serviceId,
				requestBody
			);
			return response.data.environmentVariables;
		}
	});
};
