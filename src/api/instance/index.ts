import axiosCfg from '../config';

const API = {
	INSTANCES: 'instances'
};

export interface Response {
	instances: {
		id: string;
		name: string;
		createdAt: number;
		lastLoginAt: number | null;
	}[];
}

export interface RequestBody {
	name: string;
}

export const getInstances = () => {
	return axiosCfg.get<Response>(API.INSTANCES);
};

export const getInstanceById = (instanceId: string) => {
	return axiosCfg.get<Response>(`${API.INSTANCES}/${instanceId}`);
};

export const patchInstanceById = (instanceId: string, data: RequestBody) => {
	return axiosCfg.patch<Response>(`${API.INSTANCES}/${instanceId}`, data);
};
