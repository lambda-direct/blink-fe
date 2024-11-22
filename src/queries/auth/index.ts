import { getAccessToken } from '../../api/auth';

export const useAccessToken = async (token: string | null, code: string) => {
	const response = await getAccessToken(token || null, code);
	const { accessToken, refreshToken } = response.data;
	return { accessToken, refreshToken };
};
