import api from '../http';

export default class ChatService {
    static async startChat(data: {
        users: string[];
    }): Promise<{ _id: string; users: string[] }> {
        try {
            const response = await api.post('/chat', data);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    static async getUsersChats(data: { user: string }): Promise<
        {
            chat: string;
            friend: { _id: string; email: string; username: string };
        }[]
    > {
        try {
            const response = await api.get('usersChats', {
                params: { user: data.user },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
