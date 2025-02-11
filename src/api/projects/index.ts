import axiosCfg from '../config';

const API = {
	PROJECT: (instanceId: string, projectId: string) =>
		`instances/${instanceId}/projects/${projectId}`,
	PROJECTS: (instanceId: string) => `instances/${instanceId}/projects`
};

export interface Project {
	id: string;
	name: string;
	createdAt: number;
}
export interface GetProjectsResponse {
	projects: Project[];
}

export interface GetProjectResponse {
	project: Project;
}

function getProject(instanceId: string, projectId: string) {
	return axiosCfg.get<GetProjectResponse>(API.PROJECT(instanceId, projectId));
}


function getProjects(instanceId: string) {
	return axiosCfg.get<GetProjectsResponse>(API.PROJECTS(instanceId));
}

export { getProjects, getProject };
