import { createQuery } from '@tanstack/svelte-query';
import { getServices, getService } from '../../api/services';

export const useServices = (instanceId: string, projectId: string) => {
	return createQuery({
		queryKey: ['services', instanceId, projectId],
		queryFn: async () => {
			const response = await getServices(instanceId, projectId);
			return response.data.services;
		},
		enabled: !!instanceId
	});
};

export const useService = (instanceId: string, projectId: string, serviceId: string) => {
	return createQuery({
		queryKey: ['service', instanceId, projectId, serviceId],
		queryFn: async () => {
			const response = await getService(instanceId, projectId, serviceId);
			return response.data;
		},
		enabled: !!instanceId
	});
};
