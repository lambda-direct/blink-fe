import { createQuery, type CreateQueryResult } from '@tanstack/svelte-query';
import { getUser, type UserResponse } from '../../api/user';

export const useUser = (): CreateQueryResult<UserResponse, Error> => {
	return createQuery({
		queryKey: ['user'],
		queryFn: async () => {
			const response = await getUser();
			return response;
		}
	});
};
