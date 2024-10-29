import { createQuery } from '@tanstack/svelte-query';
import { getProjects } from '../../api/projects';
import { getServices } from '../../api/services';

export const useProjects = (fetchServicesCount = false) => {
	return createQuery({
		queryKey: ['all-projects', fetchServicesCount],
		queryFn: async () => {
			const response = await getProjects();
			const { projects } = response.data;
			const servicesCountMap: { [key: string]: number } = {};

			if (fetchServicesCount) {
				await Promise.all(
					projects.map(async (project) => {
						const servicesResponse = await getServices(project.id);
						servicesCountMap[project.id] = servicesResponse.data.services.length;
					})
				);
			}

			return { projects, servicesCountMap };
		}
	});
};
