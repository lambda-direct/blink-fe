import axiosCfg from '../config';
import type { Interval } from '../statistics';

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

const API = {
	LOGS: (instanceId: string) => `instances/${instanceId}/logs/traefik`,
	LIVE_LOGS: (instanceId: string) => `instances/${instanceId}/logs/traefik/realtime`,
	SERVICE_LOGS: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/logs`,
	SERVICE_LIVE_LOGS: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/logs/realtime`
};
export interface Log {
	createdAt: number;
	message: string;
}

export interface ServiceLogsResponse {
	logs: string;
}

export interface LogsResponse {
	logs: Log[];
}

function getLogs(instanceId: string, params: { interval?: Interval } = {}) {
	return axiosCfg.get<LogsResponse>(API.LOGS(instanceId), { params });
}

function getServiceLogs(
	instanceId: string,
	projectId: string,
	serviceId: string,
	params: { interval?: Interval } = {}
) {
	return axiosCfg.get<ServiceLogsResponse>(API.SERVICE_LOGS(instanceId, projectId, serviceId), { params });
}

function getLogsRealtimeWS(instanceId: string, onMessage: (data: LogsResponse) => void) {
	const ws = new WebSocket(`wss://${BASE_URL}/${API.LIVE_LOGS(instanceId)}`);

	ws.onmessage = (event) => {
		const data: LogsResponse = JSON.parse(event.data);
		onMessage(data);
	};

	return ws;
}

function getServiceLogsRealtimeWS(
	instanceId: string,
	projectId: string,
	serviceId: string,
	onMessage: (data: ServiceLogsResponse) => void
) {
	const ws = new WebSocket(
		`wss://${BASE_URL}/${API.SERVICE_LIVE_LOGS(instanceId, projectId, serviceId)}`
	);

	ws.onmessage = (event) => {
		const data: ServiceLogsResponse = JSON.parse(event.data);
		onMessage(data);
	};

	return ws;
}

export { getLogs, getLogsRealtimeWS, getServiceLogs, getServiceLogsRealtimeWS };
