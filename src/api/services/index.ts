import axiosCfg from '../config';

const API = {
	SERVICES: (instanceId: string, projectId: string) =>
		`instances/${instanceId}/projects/${projectId}/services`,
	SERVICE: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}`,
	ENVIRONMENT_VARIABLES: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/environmentVariables`,
	ENVIRONMENT_VARIABLE: (
		instanceId: string,
		projectId: string,
		serviceId: string,
		environmentVariableId: string
	) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/environmentVariables/${environmentVariableId}`
};

export interface Service {
	id: string;
	projectId: string;
	name: string;
	type: 'deployment' | 'storage';
	commandWithArguments: string | null;
	createdAt: number;
}
export interface GetServicesResponse {
	services: Service[];
}

export interface GetServiceResponse {
	service: Service;
	portMappings: {
		id: string;
		hostAddress: string;
		hostPort: number;
		containerPort: number;
		protocol: 'http' | 'tcp' | 'udp';
		createdAt: number;
	}[];
	environmentVariables: EnvironmentVariable[];
	bindMounts: {
		id: string;
		sourcePath: string;
		destinationPath: string;
		createdAt: number;
	}[];
	domains: {
		id: string;
		name: string;
		isTlsEnabled: boolean;
		createdAt: number;
	}[];
}
export interface EnvironmentVariable {
	id: string;
	name: string;
	value: string;
	createdAt: number;
}
export interface EnvironmentVariableResponse {
	environmentVariable: EnvironmentVariable;
}
export interface EnvironmentVariablesResponse {
	environmentVariables: EnvironmentVariable[];
}
export interface EnvironmentVariablesRequestBody {
	environmentVariables: {
		name: string;
		value: string;
	}[];
	restart: boolean;
}

function getServices(instanceId: string, projectId: string) {
	return axiosCfg.get<GetServicesResponse>(API.SERVICES(instanceId, projectId));
}

function getService(instanceId: string, projectId: string, serviceId: string) {
	return axiosCfg.get<GetServiceResponse>(API.SERVICE(instanceId, projectId, serviceId));
}

function getEnvironmentVariables(instanceId: string, projectId: string, serviceId: string) {
	return axiosCfg.get<EnvironmentVariablesResponse>(
		API.ENVIRONMENT_VARIABLES(instanceId, projectId, serviceId)
	);
}

function getEnvironmentVariable(
	instanceId: string,
	projectId: string,
	serviceId: string,
	environmentVariableId: string
) {
	return axiosCfg.get<EnvironmentVariableResponse>(
		API.ENVIRONMENT_VARIABLE(instanceId, projectId, serviceId, environmentVariableId)
	);
}

function createEnvironmentVariables(
	instanceId: string,
	projectId: string,
	serviceId: string,
	requestBody: EnvironmentVariablesRequestBody
) {
	return axiosCfg.post<EnvironmentVariablesResponse>(
		API.ENVIRONMENT_VARIABLES(instanceId, projectId, serviceId),
		requestBody
	);
}

export {
	getServices,
	getService,
	getEnvironmentVariables,
	getEnvironmentVariable,
	createEnvironmentVariables
};
