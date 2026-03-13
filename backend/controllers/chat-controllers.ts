import type { Request, Response, NextFunction } from 'express';
import userService from '../service/user-service.js';
import chatService from '../service/chat-service.js';

class ChatControllers {
    async startChat(
        req: Request<{}, {}, { users: string[] }, {}>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { users } = req.body;
            const userIds = await userService.getUserIds(users);
            const chat = await chatService.startChat(userIds);
            res.status(200).json(chat);
        } catch (error) {
            next(error);
        }
    }
    async getUsersChats(
        req: Request<{}, {}, {}, { user: string }>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { user } = req.query;
            const chats = await chatService.findChats(user);
            if (!chats) res.status(200).json({ message: 'User has no chats' });
            res.status(200).json(chats);
        } catch (error) {
            next(error);
        }
    }
}

export default new ChatControllers();
