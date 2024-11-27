import axiosCfg from '../config';

const API = {
	PROJECTS: (instanceId: string) => `instances/${instanceId}/projects`
};

export interface GetProjectsResponse {
	projects: {
		id: string;
		name: string;
		createdAt: number;
	}[];
}

function getProjects(instanceId: string) {
	return axiosCfg.get<GetProjectsResponse>(API.PROJECTS(instanceId));
}

export { getProjects };
