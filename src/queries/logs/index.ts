// queries/logs.ts
import { createQuery } from '@tanstack/svelte-query';
import { getLogs, getServiceLogs } from '../../api/logs';
import type { Interval } from '../../api/statistics';
import { getRefetchInterval } from '../statistics';

export const useLogs = (params: { interval?: Interval } = {}) => {
	const refetchInterval = getRefetchInterval(params.interval);
	return createQuery({
		queryKey: ['logs', params],
		queryFn: async () => {
			const response = await getLogs(params);
			return response.data;
		},
		refetchInterval
	});
};

export const useServiceLogs = (
	projectId: string,
	serviceId: string,
	params: { interval?: Interval } = {}
) => {
	const refetchInterval = getRefetchInterval(params.interval);

	return createQuery({
		queryKey: ['service-logs', projectId, serviceId, params],
		queryFn: async () => {
			const response = await getServiceLogs(projectId, serviceId, params);
			return response.data;
		},
		refetchInterval
	});
};
