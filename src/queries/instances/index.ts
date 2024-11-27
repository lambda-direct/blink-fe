import { createMutation, createQuery } from '@tanstack/svelte-query';
import {
	getInstanceById,
	getInstances,
	patchInstanceById,
	type Response,
	type RequestBody
} from '../../api/instance';

export const useInstances = () => {
	return createQuery({
		queryKey: ['instances'],
		queryFn: async () => {
			const response = await getInstances();
			return response.data;
		}
	});
};

export const useInstanceById = (instanceId: string) => {
	return createQuery({
		queryKey: ['instance', instanceId],
		queryFn: async () => {
			const response = await getInstanceById(instanceId);
			return response.data;
		},
		enabled: !!instanceId
	});
};

export const usePatchInstance = () => {
	return createMutation<Response, unknown, { instanceId: string; data: RequestBody }>({
		mutationFn: async ({ instanceId, data }) => {
			const response = await patchInstanceById(instanceId, data);
			return response.data;
		},
	});
};
