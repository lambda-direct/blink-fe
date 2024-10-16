import axios, {
	// AxiosError,
	type AxiosInstance
	// AxiosResponse,
	// InternalAxiosRequestConfig,
} from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_API_URL;
// const new;
// const 2new;

const instance: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Access-Control-Allow-Origin': '*',
		'Content-Type': 'application/json'
	},
	withCredentials: false
});

instance.defaults.headers.get.Accept = 'application/json';

// const interceptors = instance.interceptors

// interceptors.request.use(
//   (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
//     const token = localStorage.getItem('accToken')

//     if (!token) return config

//     config.headers.Authorization = 'Bearer ' + token

//     return config
//   },
//   (err: AxiosError): Promise<AxiosError> => Promise.reject(err)
// )

// interceptors.response.use(
//   (res: AxiosResponse) => res,
//   (err: AxiosError<{ message: string }>): Promise<AxiosError> => {
//     const status = err.response?.status

//     if (status === 401) {
//       // TODO: refreshing

//       return Promise.reject(err)
//     }

//     if (err.response && err.response.data.message) {
//       throw new Error(err.response.data.message)
//     }

//     return Promise.reject(err)
//   }
// )

export default instance;
