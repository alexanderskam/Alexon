import type { DefaultEventsMap, Socket } from 'socket.io';
import { Chat } from '../../models/chat-model.js';

export const checkUserInChat = async (
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    userId: string,
    chatId: string,
): Promise<boolean> => {
    const chat = await Chat.findById(chatId);
    if (chat) {
        const user = chat.users.find(
            (participantId) => participantId.toString() === userId,
        );
        if (!user) {
            socket.emit('error', 'Пользователь не является участником чата');
            return false;
        }
        return true;
    }
    return false;
};
