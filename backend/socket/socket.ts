import type { IncomingMessage, ServerResponse } from 'http';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import tokenService from '../service/token-service.js';
import { Message } from '../models/message-model.js';
import { checkUserInChat } from './utils/checker.js';
import { uncheckedMessagesFinder } from './utils/uncheckedMessagesFinder.js';
import { Chat } from '../models/chat-model.js';
import { User } from '../models/user-model.js';

export const initSocket = (
    httpServer: HttpServer<typeof IncomingMessage, typeof ServerResponse>,
    clientUrl: string,
) => {
    const onlineList = new Set();

    const io = new Server(httpServer, {
        cors: {
            origin: clientUrl,
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        const bearer = socket.handshake.auth.accessToken;
        if (!bearer) return next(new Error('Unauthorized'));
        const token = bearer.split(' ')[1];
        try {
            const userData = tokenService.validateAccessToken(token);
            if (!userData) return next(new Error('Unauthorized'));
            socket.data.senderId = userData.id;
            next();
        } catch {
            console.log('error');
            next(new Error('Unauthorized'));
        }
    });

    io.on('connection', async (socket) => {
        console.log('user connected:', socket.data.senderId);
        onlineList.add(socket.data.senderId);
        io.emit('online-list', [...onlineList]);
        // const uncheckedMessages = await uncheckedMessagesFinder(
        //     socket.data.senderId.toString(),
        // );
        // console.log('UNCHECKED: ', uncheckedMessages);
        // socket.emit('unchecked-messages', [...uncheckedMessages]);
        socket.join(socket.data.senderId);

        socket.on('get-first-info', async () => {
            io.emit('online-list', [...onlineList]);
            const uncheckedMessages = await uncheckedMessagesFinder(
                socket.data.senderId.toString(),
            );
            console.log('UNCHECKED: ', uncheckedMessages);
            socket.emit('unchecked-messages', [...uncheckedMessages]);
        });

        socket.on('join-room', async (roomId) => {
            const allowed = await checkUserInChat(
                socket,
                socket.data.senderId,
                roomId,
            );
            if (!allowed) return;
            socket.join(roomId);
            const messages = await Message.find({ chatId: roomId }).sort({
                createdAt: 1,
            });
            if (!messages) socket.emit('chat-history', []);
            socket.emit('chat-history', messages);
            console.log(`socket ${socket.id} joined ${roomId}`);
        });

        socket.on('leave-room', () => {
            for (const room of socket.rooms) {
                if (room !== socket.id && room !== socket.data.senderId) {
                    socket.leave(room);
                }
            }
        });

        socket.on('message', async ({ roomId, message }) => {
            if (!socket.rooms.has(roomId)) return;
            const mes = await Message.create({
                chatId: message.chatId,
                from: socket.data.senderId,
                body: message.body,
                createdAt: new Date(message.createdAt),
                isChecked: false,
            });
            io.to(roomId).emit('message', mes);
            const chat = await Chat.findById(roomId);
            const consumer = chat?.users
                .find((user) => user.toString() !== socket.data.senderId)
                ?.toString();
            if (consumer) {
                const uncheckedMessages =
                    await uncheckedMessagesFinder(consumer);
                // console.log('USER: ', socket.data.senderId);
                // console.log('ROOMS: ', socket.rooms);
                // console.log('UNCHECKED: ', uncheckedMessages);
                // console.log('CONSUMER: ', consumer);
                io.to(consumer.toString()).emit('unchecked-messages', [
                    ...uncheckedMessages,
                ]);
            }
        });

        socket.on('delete-message', async ({ roomId, id }) => {
            const message = await Message.findByIdAndDelete(id);
            if (message) io.to(roomId).emit('delete-message', id);
            else io.to(roomId).emit('error', 'Ошибка удаления сообщения');
            const chat = await Chat.findById(roomId);
            const consumer = chat?.users
                .find((user) => user.toString() !== socket.data.senderId)
                ?.toString();
            if (consumer) {
                const uncheckedMessages =
                    await uncheckedMessagesFinder(consumer);
                // console.log('USER: ', socket.data.senderId);
                // console.log('ROOMS: ', socket.rooms);
                // console.log('UNCHECKED: ', uncheckedMessages);
                // console.log('CONSUMER: ', consumer);
                io.to(consumer.toString()).emit('unchecked-messages', [
                    ...uncheckedMessages,
                ]);
            }
        });

        let typingTimeout: NodeJS.Timeout;

        socket.on('typing', (roomId) => {
            clearTimeout(typingTimeout);
            socket.to(roomId).emit('typing');
            typingTimeout = setTimeout(() => {
                socket.to(roomId).emit('stop-typing');
            }, 1000);
        });

        socket.on('check-message', async ({ roomId, messageId }) => {
            console.log('check-message');
            await Message.findByIdAndUpdate(messageId, { isChecked: true });
            socket.to(roomId).emit('check-message', messageId);
            const uncheckedMessages = await uncheckedMessagesFinder(
                socket.data.senderId,
            );
            io.to(socket.data.senderId).emit('unchecked-messages', [
                ...uncheckedMessages,
            ]);
        });

        socket.on('chat-deleted', async (chatId: string) => {
            try {
                await Message.deleteMany({ chatId: chatId });
                const chat = await Chat.findByIdAndDelete(chatId);
                chat?.users.forEach((user) => {
                    io.to(user.toString()).emit('chat-deleted', chatId);
                });
            } catch {
                io.to(socket.data.senderId.toString()).emit(
                    'error',
                    'Ошибка удаления чата',
                );
            }
        });

        socket.on('chat-started', async (chatId: string) => {
            const chat = await Chat.findById(chatId);
            const userToEmit = chat?.users.find(
                (user) => user.toString() !== socket.data.senderId.toString(),
            );
            if (userToEmit) {
                const uncheckedMessages = await uncheckedMessagesFinder(
                    userToEmit.toString(),
                );
                io.to(userToEmit.toString()).emit('unchecked-messages', [
                    ...uncheckedMessages,
                ]);
                io.to(userToEmit.toString()).emit('chat-started');
            }
        });

        socket.on('delete-user', async (userId: string) => {
            try {
                await User.findByIdAndDelete(userId);
                const chats = await Chat.find({ users: userId });
                await Chat.deleteMany({ users: userId });
                if (chats.length === 0) return;
                for (let i = 0; i < chats.length; i++) {
                    const chatId = chats[i]?._id;
                    if (!chatId) continue;
                    await Message.deleteMany({ chatId: chatId });
                    const userToEmit = chats[i]?.users.find(
                        (user) =>
                            user.toString() !== socket.data.senderId.toString(),
                    );
                    if (userToEmit) {
                        io.to(userToEmit.toString()).emit('chat-started');
                    }
                }
                io.to(socket.data.senderId.toString()).emit('user-deleted');
            } catch (error) {
                io.to(socket.data.senderId.toString()).emit(
                    'error',
                    'Ошибка удаления пользователя',
                );
            }
        });

        socket.on('disconnect', () => {
            onlineList.delete(socket.data.senderId);
            io.emit('online-list', [...onlineList]);
            console.log('user disconnected:', socket.id);
        });
    });

    return io;
};
