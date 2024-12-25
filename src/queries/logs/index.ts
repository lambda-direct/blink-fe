import { createQuery } from '@tanstack/svelte-query';
import { getLogs, getProjectLogs, getServiceLogs } from '../../api/logs';
import type { Interval } from '../../api/statistics';
import { getRefetchInterval } from '../statistics';

export const useLogs = (instanceId: string, params: { interval?: Interval } = {}) => {
	const refetchInterval = getRefetchInterval(params.interval);

	return createQuery({
		queryKey: ['logs', instanceId, params],
		queryFn: async () => {
			const response = await getLogs(instanceId, params);
			return response.data;
		},
		refetchInterval,
		retry: false, 
		enabled: !!instanceId,
	});
};

export const useProjectLogs = (
	instanceId: string,
	projectId: string,
	params: { interval?: Interval } = {}
) => {
	const refetchInterval = getRefetchInterval(params.interval);

	return createQuery({
		queryKey: ['project-logs', instanceId, projectId, params],
		queryFn: async () => {
			const response = await getProjectLogs(instanceId, projectId, params);
			return response.data;
		},
		refetchInterval,
		retry: false, 
		enabled: !!instanceId,
	});
};

export const useServiceLogs = (
	instanceId: string,
	projectId: string,
	serviceId: string,
	params: { interval?: Interval } = {}
) => {
	const refetchInterval = getRefetchInterval(params.interval);

	return createQuery({
		queryKey: ['service-logs', instanceId, projectId, serviceId, params],
		queryFn: async () => {
			const response = await getServiceLogs(instanceId, projectId, serviceId, params);
			return response.data;
		},
		refetchInterval,
		retry: false, 
		enabled: !!instanceId
	});
};
