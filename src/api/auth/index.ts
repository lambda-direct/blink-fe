import axiosCfg from '../config';
import axios, { type AxiosResponse } from 'axios';

const API = {
	AUTH: 'auth',
	REFRESH: '/auth/refresh'
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

async function refreshAccessToken(baseUrl: string, refreshToken: string): Promise<AxiosResponse<AccessTokenResponse>> {
	return axios.post<AccessTokenResponse>(`${baseUrl}${API.REFRESH}`, { refreshToken });
}

export { getAccessToken, refreshAccessToken };
