import type { IUser } from '../types/authResponse';
import api from '../http';

export class UserService {
    static async fetchUsers(
        username: string,
        email: string,
        usersAmount: number,
        signal: AbortSignal,
    ): Promise<IUser[]> {
        try {
            const response = await api.get('/user', {
                params: {
                    username,
                    email,
                    usersAmount,
                },
                signal,
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async deleteUser(data: { userId: string }): Promise<void> {
        try {
            await api.post('/deleteUser', data);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
