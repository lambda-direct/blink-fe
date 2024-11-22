import { getAccessToken } from '../../api/auth';

export const useAccessToken = async (token: string, code: string) => {
	const response = await getAccessToken(token, code);
	const { accessToken, refreshToken } = response.data;

	return { accessToken, refreshToken };
};
