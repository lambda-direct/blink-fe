import axiosCfg from '../config';

const API = {
	PROJECTS: 'projects'
};

export interface GetProjectsResponse {
	projects: {
		id: string;
		name: string;
		createdAt: number;
	}[];
}

function getProjects() {
	return axiosCfg.get<GetProjectsResponse>(API.PROJECTS);
}

export { getProjects };
