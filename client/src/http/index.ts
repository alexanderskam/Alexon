import axios, { AxiosError } from 'axios';
import type { ILoginResponse } from '../types/authResponse';

export const API_URL = 'http://localhost:3000/api'; //https://alexon.onrender.com http://localhost:3000

const api = axios.create({
    withCredentials: true,
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
});

api.interceptors.response.use(
    (config) => {
        return config;
    },
    async (error: AxiosError) => {
        console.log('in interceptor');
        try {
            const originalRequest = error.config;
            if (error.response?.status == 401) {
                const response = await axios.get<ILoginResponse>(
                    `${API_URL}/refresh`,
                    { withCredentials: true },
                );
                localStorage.setItem('token', `${response.data.accessToken}`);
                if (originalRequest) return api.request(originalRequest);
            } else throw error;
        } catch {
            throw error;
        }
    },
);

export default api;
