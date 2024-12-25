import axios, { type AxiosInstance } from 'axios';
import { refreshAccessToken } from './auth';

const BASE_URL = import.meta.env.VITE_BASE_API_URL;
const HTTPS_BASE_URL = `https://${BASE_URL}`;


const instance: AxiosInstance = axios.create({
	baseURL: HTTPS_BASE_URL,
	headers: {
		'Access-Control-Allow-Origin': '*',
		'Content-Type': 'application/json'
	},
	withCredentials: false
});

instance.defaults.headers.get.Accept = 'application/json';

instance.interceptors.request.use(
	(config) => {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			config.headers['Authorization'] = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => {
		console.error('Request Interceptor Error:', error);
		return Promise.reject(error);
	}
);

instance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (originalRequest && error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const refreshToken = localStorage.getItem('refreshToken');
				if (!refreshToken) throw new Error('No refresh token available');

				const response = await refreshAccessToken(refreshToken);
				const { accessToken, refreshToken: newRefreshToken } = response.data;

				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('refreshToken', newRefreshToken);

				instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
				originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

				return instance(originalRequest);
			} catch (refreshError) {
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

export default instance;
