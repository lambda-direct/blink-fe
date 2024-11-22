import axiosCfg from '../config';

const API = {
	AUTH: 'auth',
	REFRESH: 'auth/refresh'
};

export interface AccessTokenResponse {
	accessToken: string;
	refreshToken: string;
}

function getAccessToken(token: string | null, code: string) {
	const params: Record<string, string> = { code };
	if (token) params.token = token;

	return axiosCfg.get<AccessTokenResponse>(API.AUTH, { params });
}

function refreshAccessToken(refreshToken: string) {
	return axiosCfg.post<AccessTokenResponse>(API.REFRESH, {
		refreshToken
	});
}

export { getAccessToken, refreshAccessToken };
