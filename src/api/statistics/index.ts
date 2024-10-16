import axiosCfg from '../config';

const API = {
	CHART: 'chart',
	LIVE: 'realtime'
};

interface StatisticsResponse {
	chart: StatisticChart[];
}

export type StatisticChart = {
	cpuUsage: number;
	diskUsage: number;
	timestamp: number;
	memoryUsage: number;
};
export type Interval = '1d' | '7d' | '14d' | '30d';

function getChartStatistics(params: { interval?: Interval } = {}) {
	return axiosCfg.get<StatisticsResponse>(API.CHART, { params });
}

function getLiveStatistics() {
	return axiosCfg.get<StatisticsResponse>(API.LIVE);
}

export { getChartStatistics, getLiveStatistics };
