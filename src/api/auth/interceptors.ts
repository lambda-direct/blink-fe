import { refreshAccessToken } from '.';
import axiosCfg from '../config';

axiosCfg.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const refreshToken = localStorage.getItem('refreshToken');
				if (!refreshToken) throw new Error('No refresh token available');

				const response = await refreshAccessToken(refreshToken);
				const { accessToken, refreshToken: newRefreshToken } = response.data;

				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('refreshToken', newRefreshToken);

				axiosCfg.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
				originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
				return axiosCfg(originalRequest);
			} catch (refreshError) {
				window.location.href = '/';
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);
