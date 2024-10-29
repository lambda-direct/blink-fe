import { createQuery } from '@tanstack/svelte-query';
import { getServices, getService } from '../../api/services';

export const useServices = (projectId: string) => {
	return createQuery({
		queryKey: ['services', projectId], 
		queryFn: async () => {
			const response = await getServices(projectId);
			return response.data.services;
		}
	});
};

export const useService = (projectId: string, serviceId: string) => {
	return createQuery({
		queryKey: ['service', projectId, serviceId],
		queryFn: async () => {
			const response = await getService(projectId, serviceId);
			return response.data;
		}
	});
};
