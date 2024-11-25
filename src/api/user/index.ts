import axiosCfg from '../config';

const API = {
	USER: 'user'
};

export interface UserResponse {
	user: {
		githubId: number;
		login: string;
		name: string | null;
		email: string;
		avatarUrl: string;
		createdAt: number;
	};
}

export const getUser = async (): Promise<UserResponse> => {
	const response = await axiosCfg.get<UserResponse>(API.USER);
	return response.data;
};
