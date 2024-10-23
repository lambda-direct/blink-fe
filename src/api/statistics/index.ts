import axiosCfg from '../config';

const API = {
	CHART: 'chart',
	LIVE: 'realtime'
};

interface StatisticsResponse {
	chart: StatisticChart[];
	values: {
		totalFileSystem: number;
		totalMemory: number;
	};
}

export type StatisticChart = {
	averageCpuLoad: number;
	usedFileSystem: number;
	usedMemory: number;
	timestamp: number;
};
export type Interval = '1d' | '7d' | '14d' | '30d';

function getChartStatistics(params: { interval?: Interval } = {}) {
	return axiosCfg.get<StatisticsResponse>(API.CHART, { params });
}

function getLiveStatistics() {
	return axiosCfg.get<StatisticsResponse>(API.LIVE);
}

export { getChartStatistics, getLiveStatistics };
