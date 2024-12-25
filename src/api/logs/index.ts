import axiosCfg from '../config';
import type { Service } from '../services';
import type { Interval } from '../statistics';

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

const API = {
	LOGS: (instanceId: string) => `instances/${instanceId}/logs/traefik`,
	LIVE_LOGS: (instanceId: string) => `ws-debug/instances/${instanceId}/logs/traefik/realtime`,
	PROJECT_LOGS: (instanceId: string, projectId: string) =>
		`instances/${instanceId}/projects/${projectId}/logs`,
	SERVICE_LOGS: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/logs`,
	SERVICE_LIVE_LOGS: (instanceId: string, projectId: string, serviceId: string) =>
		`ws-debug/instances/${instanceId}/projects/${projectId}/services/${serviceId}/logs/realtime`
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

export interface ProjectLog {
	service: Service;
	logs: string;
}

export interface ProjectLogsResponse {
	success: boolean;
	data: ProjectLog[];
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

function getProjectLogs(instanceId: string, projectId: string, params: { interval?: Interval } = {}) {
	return axiosCfg.get<ProjectLogsResponse>(API.PROJECT_LOGS(instanceId, projectId), { params });
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

export { getLogs, getLogsRealtimeWS, getServiceLogs, getProjectLogs, getServiceLogsRealtimeWS };
