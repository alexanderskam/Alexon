import { Chat } from '../../models/chat-model.js';
import { Message } from '../../models/message-model.js';
import type { Types } from 'mongoose';

export const uncheckedMessagesFinder = async (userId: string) => {
    const uncheckedMessages: Types.ObjectId[] = [];

    const usersChats = await Chat.find({
        users: userId,
    });

    for (const chat of usersChats) {
        const messages = await Message.find({ chatId: chat._id });
        for (const message of messages) {
            if (
                message.from &&
                message.isChecked === false &&
                !uncheckedMessages.some((m) => m.equals(message.from))
            ) {
                uncheckedMessages.push(message.from);
            }
        }
    }

    return uncheckedMessages;
};
