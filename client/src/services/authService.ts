import type { ILoginResponse } from '../types/authResponse';
import api from '../http';

export default class AuthService {
    static async login(data: {
        email: string;
        password: string;
    }): Promise<ILoginResponse> {
        try {
            const result = await api.post<ILoginResponse>('/login', data);
            return result.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async registration(data: {
        username: string;
        email: string;
        password: string;
    }): Promise<ILoginResponse> {
        try {
            const result = await api.post<ILoginResponse>(
                '/registration',
                data,
            );
            return result.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async logout() {
        try {
            const result = await api.post('/logout');
            return result.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
