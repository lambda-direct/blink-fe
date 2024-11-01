import axiosCfg from '../config';
import type { Interval } from '../statistics';
const BASE_URL = import.meta.env.VITE_BASE_API_URL;

const API = {
	LOGS: 'logs/traefik',
	LIVE_LOGS: 'logs/traefik/realtime',
	SERVICE_LOGS: (projectId: string, serviceId: string) =>
		`projects/${projectId}/services/${serviceId}/logs`,
	SERVICE_LIVE_LOGS: (projectId: string, serviceId: string) =>
		`projects/${projectId}/services/${serviceId}/logs/realtime`
};

export interface LogsResponse {
	logs: string;
}

function getLogs(params: { interval?: Interval } = {}) {
	return axiosCfg.get<LogsResponse>(API.LOGS, { params });
}

function getServiceLogs(
	projectId: string,
	serviceId: string,
	params: { interval?: Interval } = {}
) {
	return axiosCfg.get<LogsResponse>(API.SERVICE_LOGS(projectId, serviceId), { params });
}

function getLogsRealtimeWS(onMessage: (data: LogsResponse) => void) {
	const ws = new WebSocket(`wss://${BASE_URL}/${API.LIVE_LOGS}`);

	ws.onmessage = (event) => {
		const data: LogsResponse = JSON.parse(event.data);
		onMessage(data);
	};

	return ws;
}

function getServiceLogsRealtimeWS(
	projectId: string,
	serviceId: string,
	onMessage: (data: LogsResponse) => void
) {
	const ws = new WebSocket(`wss://${BASE_URL}/${API.SERVICE_LIVE_LOGS(projectId, serviceId)}`);

	ws.onmessage = (event) => {
		const data: LogsResponse = JSON.parse(event.data);
		onMessage(data);
	};

	return ws;
}

export { getLogs, getLogsRealtimeWS, getServiceLogs, getServiceLogsRealtimeWS };
