import { createQuery } from '@tanstack/svelte-query';
import { getProject, getProjects } from '../../api/projects';
import { getServices } from '../../api/services';

export const useProject = (instanceId: string, projectId: string) => {
	return createQuery({
		queryKey: ['project', instanceId, projectId],
		queryFn: async () => {
			const response = await getProject(instanceId, projectId);
			return response.data.project;
		},
		enabled: !!instanceId && !!projectId,
		retry: false
	});
};

export const useProjects = (instanceId: string, fetchServicesCount = false) => {
	let accessToken: string | null = null;
	if (typeof window !== 'undefined') {
		accessToken = localStorage.getItem('accessToken');
	}
	return createQuery({
		queryKey: ['all-projects', instanceId, fetchServicesCount],
		queryFn: async () => {
			const response = await getProjects(instanceId);
			const { projects } = response.data;
			const servicesCountMap: { [key: string]: number } = {};

			if (fetchServicesCount) {
				await Promise.all(
					projects.map(async (project) => {
						const servicesResponse = await getServices(instanceId, project.id);
						servicesCountMap[project.id] = servicesResponse.data.services.length;
					})
				);
			}

			return { projects, servicesCountMap };
		},
		enabled: !!instanceId && !!accessToken,
		retry: false
	});
};
