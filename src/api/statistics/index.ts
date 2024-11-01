import axiosCfg from '../config';
const BASE_URL = import.meta.env.VITE_BASE_API_URL;

const API = {
	CHART: 'resourceUsage/chart',
	LIVE_CHART: 'resourceUsage/realtime',
	SERVICE_LIVE_CHART: (projectId: string, serviceId: string) =>
		`projects/${projectId}/services/${serviceId}/resourceUsage/realtime`,
	SERVICE_HTTP_CHART: (projectId: string, serviceId: string) =>
		`/projects/${projectId}/services/${serviceId}/httpStats/chart`
};

interface StatisticsResponse {
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

export type Interval = '1d' | '7d' | '14d' | '30d';

function getChartStatistics(params: { interval?: Interval } = {}) {
	return axiosCfg.get<StatisticsResponse>(API.CHART, { params });
}

function getHttpStats(projectId: string, serviceId: string, params: { interval?: Interval } = {}) {
	return axiosCfg.get<ServiceHttpStatsResponse>(API.SERVICE_HTTP_CHART(projectId, serviceId), {
		params
	});
}

function getServiceResourceUsageWS(
	projectId: string,
	serviceId: string,
	onMessage: (data: GetServiceResourceUsage) => void
) {
	const ws = new WebSocket(`wss://${BASE_URL}/${API.SERVICE_LIVE_CHART(projectId, serviceId)}`);

	ws.onmessage = (event) => {
		const data: GetServiceResourceUsage = JSON.parse(event.data);
		onMessage(data);
	};

	return ws;
}

function getLiveStatisticsWS(onMessage: (data: StatisticsResponse) => void) {
	const ws = new WebSocket(`wss://${BASE_URL}/${API.LIVE_CHART}`);

	ws.onmessage = (event) => {
		const data: StatisticsResponse = JSON.parse(event.data);
		onMessage(data);
	};

	return ws;
}

export { getChartStatistics, getLiveStatisticsWS, getHttpStats, getServiceResourceUsageWS };
