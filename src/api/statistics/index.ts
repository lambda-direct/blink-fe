import axiosCfg from '../config';
const BASE_URL = import.meta.env.VITE_BASE_API_URL;

const API = {
	CHART: (instanceId: string) => `instances/${instanceId}/resourceUsage/chart`,
	LIVE_CHART: (instanceId: string) => `instances/${instanceId}/resourceUsage/realtime`,
	SERVICE_LIVE_CHART: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/resourceUsage/realtime`,
	SERVICE_CHART: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/resourceUsage/chart`,
	SERVICE_HTTP_CHART: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/httpStats/chart`
};

export interface StatisticsResponse {
	chart: StatisticsChart[];
	values: {
		totalFileSystem: number;
		totalMemory: number;
	};
}

export type StatisticsChart = {
	averageCpuLoad: number;
	usedFileSystem: number;
	usedMemory: number;
	timestamp: number;
};

interface GetServiceResourceUsage {
	averageCpuLoad: number;
	usedMemory: number;
	totalMemory: number;
	timestamp: number;
}

interface ServiceHttpStatsResponse {
	responseTimeChart: {
		averageResponseTime: number;
		timestamp: number;
	}[];
	statusCodeCountChart: {
		statusCodeCounts: Record<number, number>;
		timestamp: number;
	}[];
}

export type Interval = '1h' | '1d' | '7d' | '30d';
export const periods = [
	{ value: '1h', label: '1 Hour' },
	{ value: '1d', label: '24 Hour' },
	{ value: '7d', label: 'Week' },
	{ value: '30d', label: 'Month' }
];


function getChartStatistics(instanceId: string, params: { interval?: Interval } = {}) {
	return axiosCfg.get<StatisticsResponse>(API.CHART(instanceId), { params });
}

function getHttpStats(
	instanceId: string,
	projectId: string,
	serviceId: string,
	params: { interval?: Interval } = {}
) {
	return axiosCfg.get<ServiceHttpStatsResponse>(
		API.SERVICE_HTTP_CHART(instanceId, projectId, serviceId),
		{ params }
	);
}

function getServiceResourceUsage(
	instanceId: string,
	projectId: string,
	serviceId: string,
	params: { interval?: Interval } = {}
) {
	return axiosCfg.get<StatisticsResponse>(
		API.SERVICE_CHART(instanceId, projectId, serviceId),
		{ params }
	);
}

function getServiceResourceUsageWS(
	instanceId: string,
	projectId: string,
	serviceId: string,
	onMessage: (data: GetServiceResourceUsage) => void
) {
	const ws = new WebSocket(
		`wss://${BASE_URL}/${API.SERVICE_LIVE_CHART(instanceId, projectId, serviceId)}`
	);

	ws.onmessage = (event) => {
		const data: GetServiceResourceUsage = JSON.parse(event.data);
		onMessage(data);
	};

	return ws;
}

function getLiveStatisticsWS(instanceId: string, onMessage: (data: StatisticsResponse) => void) {
	const ws = new WebSocket(
			`wss://${BASE_URL}/${API.LIVE_CHART(instanceId)}`
	);

	ws.onmessage = (event) => {
		const data: StatisticsResponse = JSON.parse(event.data);
		onMessage(data);
	};

	return ws;
}
export { getChartStatistics, getLiveStatisticsWS, getHttpStats, getServiceResourceUsage, getServiceResourceUsageWS };
