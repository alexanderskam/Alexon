import type { Types } from 'mongoose';
import { Chat } from '../models/chat-model.js';
import { Message } from '../models/message-model.js';

class ChatService {
    async startChat(users: Types.ObjectId[]) {
        users.sort((a, b) => a.toString().localeCompare(b.toString()));

        const participantsKey = users.map((id) => id.toString()).join('_');

        let chat = await Chat.findOne({ participantsKey });

        if (!chat) {
            chat = await Chat.create({ users, participantsKey });
        }

        return chat;
    }
    async findChats(userId: string) {
        const chats = await Chat.find({
            users: userId,
        }).populate('users', '_id email username');
        const response = chats.map((chat) => {
            const friend = chat.users.find(
                (user) => String(user._id) !== userId,
            );
            return {
                chat: chat._id,
                friend,
            };
        });

        return response;
    }
}

export default new ChatService();
