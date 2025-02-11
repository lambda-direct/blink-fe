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
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/environmentVariables/${environmentVariableId}`,
	DOMAINS: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/domains`,
	DOMAIN: (instanceId: string, projectId: string, serviceId: string, domainId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/domains/${domainId}`,
	PORT_MAPPINGS: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/portMappings`,
	PORT_MAPPING: (instanceId: string, projectId: string, serviceId: string, portMappingId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/portMappings/${portMappingId}`,
	BIND_MOUNTS: (instanceId: string, projectId: string, serviceId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/bindMounts`,
	BIND_MOUNT: (instanceId: string, projectId: string, serviceId: string, bindMountId: string) =>
		`instances/${instanceId}/projects/${projectId}/services/${serviceId}/bindMounts/${bindMountId}`
};

export interface Service {
	id: string;
	projectId: string;
	name: string;
	type: 'deployment' | 'storage';
	imageName: string;
	commandWithArguments: string | null;
	createdAt: number;
}
export interface GetServicesResponse {
	services: Service[];
}

export interface GetServiceResponse {
	service: Service;
	portMappings: PortMapping[];
	environmentVariables: EnvironmentVariable[];
	bindMounts: BindMount[];
	domains: Domain[];
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

export interface BindMount {
	id: string;
	sourcePath: string;
	destinationPath: string;
	createdAt: number;
}

export interface CreateBindMountRequestBody {
	bindMount: {
		sourcePath: string;
		destinationPath: string;
	};
	restart: boolean;
}

export interface UpdateBindMountRequestBody {
	bindMount: {
		sourcePath?: string;
		destinationPath?: string;
	};
}

export interface Domain {
	id: string;
	name: string;
	email: string | null;
	isTlsEnabled: boolean;
	createdAt: number;
}

export interface GetDomainsResponse {
	domains: Domain[];
}

export interface GetDomainResponse {
	domain: Domain;
}

export interface CreateDomainRequestBody {
	domain: {
		name: string | null;
		email: string | null;
		isTlsEnabled: boolean;
	};
}

export interface PortMapping {
	id: string;
	hostAddress: string;
	hostPort: number;
	containerPort: number;
	protocol: 'http' | 'tcp' | 'udp';
	createdAt: number;
}

export interface CreatePortMappingRequestBody {
	portMapping: {
		hostAddress: string;
		hostPort: number;
		containerPort: number;
		protocol: 'http' | 'tcp' | 'udp';
	};
}

export interface UpdatePortMappingRequestBody {
	portMapping: {
		hostAddress?: string;
		hostPort?: number;
		containerPort?: number;
		protocol?: 'http' | 'tcp' | 'udp';
	};
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

function getDomains(instanceId: string, projectId: string, serviceId: string) {
	return axiosCfg.get<GetDomainsResponse>(API.DOMAINS(instanceId, projectId, serviceId));
}

function getDomain(instanceId: string, projectId: string, serviceId: string, domainId: string) {
	return axiosCfg.get<GetDomainResponse>(API.DOMAIN(instanceId, projectId, serviceId, domainId));
}

function createDomain(
	instanceId: string,
	projectId: string,
	serviceId: string,
	requestBody: CreateDomainRequestBody
) {
	return axiosCfg.post<GetDomainResponse>(
		API.DOMAINS(instanceId, projectId, serviceId),
		requestBody
	);
}

function deleteDomain(instanceId: string, projectId: string, serviceId: string, domainId: string) {
	return axiosCfg.delete<GetDomainResponse>(API.DOMAIN(instanceId, projectId, serviceId, domainId));
}

function getPortMappings(instanceId: string, projectId: string, serviceId: string) {
	return axiosCfg.get<{ portMappings: PortMapping[] }>(
		API.PORT_MAPPINGS(instanceId, projectId, serviceId)
	);
}

function getPortMapping(
	instanceId: string,
	projectId: string,
	serviceId: string,
	portMappingId: string
) {
	return axiosCfg.get<{ portMapping: PortMapping }>(
		API.PORT_MAPPING(instanceId, projectId, serviceId, portMappingId)
	);
}

function createPortMapping(
	instanceId: string,
	projectId: string,
	serviceId: string,
	requestBody: CreatePortMappingRequestBody
) {
	return axiosCfg.post<{ portMapping: PortMapping }>(
		API.PORT_MAPPINGS(instanceId, projectId, serviceId),
		requestBody
	);
}

function updatePortMapping(
	instanceId: string,
	projectId: string,
	serviceId: string,
	portMappingId: string,
	requestBody: UpdatePortMappingRequestBody
) {
	return axiosCfg.patch<{ portMapping: PortMapping }>(
		API.PORT_MAPPING(instanceId, projectId, serviceId, portMappingId),
		requestBody
	);
}

function deletePortMapping(
	instanceId: string,
	projectId: string,
	serviceId: string,
	portMappingId: string
) {
	return axiosCfg.delete<{ portMapping: PortMapping }>(
		API.PORT_MAPPING(instanceId, projectId, serviceId, portMappingId)
	);
}

function getBindMounts(instanceId: string, projectId: string, serviceId: string) {
	return axiosCfg.get<{ bindMounts: BindMount[] }>(
		API.BIND_MOUNTS(instanceId, projectId, serviceId)
	);
}

function getBindMount(
	instanceId: string,
	projectId: string,
	serviceId: string,
	bindMountId: string
) {
	return axiosCfg.get<{ bindMount: BindMount }>(
		API.BIND_MOUNT(instanceId, projectId, serviceId, bindMountId)
	);
}

function createBindMount(
	instanceId: string,
	projectId: string,
	serviceId: string,
	requestBody: CreateBindMountRequestBody
) {
	return axiosCfg.post<{ bindMount: BindMount }>(
		API.BIND_MOUNTS(instanceId, projectId, serviceId),
		requestBody
	);
}

function updateBindMount(
	instanceId: string,
	projectId: string,
	serviceId: string,
	bindMountId: string,
	requestBody: UpdateBindMountRequestBody,
	restart: boolean
) {
	return axiosCfg.patch<{ bindMount: BindMount }>(
		API.BIND_MOUNT(instanceId, projectId, serviceId, bindMountId),
		{ ...requestBody, restart }
	);
}

function deleteBindMount(
	instanceId: string,
	projectId: string,
	serviceId: string,
	bindMountId: string,
	restart?: 'true' | 'false'
) {
	return axiosCfg.delete<{ bindMount: BindMount }>(
		API.BIND_MOUNT(instanceId, projectId, serviceId, bindMountId),
		{ params: { restart } }
	);
}

export {
	getServices,
	getService,
	getEnvironmentVariables,
	getEnvironmentVariable,
	createEnvironmentVariables,
	getDomains,
	getDomain,
	createDomain,
	deleteDomain,
	getPortMappings,
	getPortMapping,
	createPortMapping,
	updatePortMapping,
	deletePortMapping,
	getBindMounts,
	getBindMount,
	createBindMount,
	updateBindMount,
	deleteBindMount
};
