import axiosCfg from '../config';

const API = {
	SERVICES: (instanceId: string, projectId: string) =>
		`instances/${instanceId}/projects/${projectId}/services`,
	SERVICE: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}`
};
export interface GetServicesResponse {
	services: {
		id: string;
		projectId: string;
		name: string;
		type: 'deployment' | 'storage';
		createdAt: number;
	}[];
}

export interface GetServiceResponse {
	service: {
		id: string;
		name: string;
		imageName: string;
		type: 'deployment' | 'storage';
		commandWithArguments: string | null;
		createdAt: number;
	};
	portMappings: {
		id: string;
		hostAddress: string;
		hostPort: number;
		containerPort: number;
		protocol: 'http' | 'tcp' | 'udp';
		createdAt: number;
	}[];
	environmentVariables: {
		id: string;
		name: string;
		value: string;
		createdAt: number;
	}[];
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

function getServices(instanceId: string, projectId: string) {
	return axiosCfg.get<GetServicesResponse>(API.SERVICES(instanceId, projectId));
}

function getService(instanceId: string, projectId: string, serviceId: string) {
	return axiosCfg.get<GetServiceResponse>(API.SERVICE(instanceId, projectId, serviceId));
}

export { getServices, getService };
