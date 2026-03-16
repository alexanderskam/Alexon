import type { IncomingMessage, ServerResponse } from 'http';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import {
    chatDeletedHandler,
    chatStartedHandler,
    checkMessageHandler,
    connectionHandler,
    deleteMessageHandler,
    deleteUserHandler,
    disconnectHandler,
    getFirstInfoHandler,
    joinRoomHandler,
    leaveRoomHandler,
    messageHandler,
    socketMiddleware,
    typingHandler,
} from './utils/controllers.js';

export const initSocket = (
    httpServer: HttpServer<typeof IncomingMessage, typeof ServerResponse>,
    clientUrl: string,
) => {
    const onlineList = new Set<string>();

    const io = new Server(httpServer, {
        cors: {
            origin: clientUrl,
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        await socketMiddleware(socket, next);
    });

    io.on('connection', async (socket) => {
        connectionHandler(socket, onlineList, io);

        socket.on('get-first-info', async () => {
            await getFirstInfoHandler(io, onlineList, socket);
        });

        socket.on('join-room', async (roomId) => {
            await joinRoomHandler(roomId, socket);
        });

        socket.on('leave-room', () => {
            leaveRoomHandler(socket);
        });

        socket.on('message', async ({ roomId, message }) => {
            await messageHandler(roomId, message, socket, io);
        });

        socket.on('delete-message', async ({ roomId, id }) => {
            await deleteMessageHandler(roomId, id, socket, io);
        });

        let typingTimeout: NodeJS.Timeout;

        socket.on('typing', (roomId) => {
            clearTimeout(typingTimeout);
            typingHandler(roomId, socket);
            typingTimeout = setTimeout(() => {
                socket.to(roomId).emit('stop-typing');
            }, 1000);
        });

        socket.on('check-message', async ({ roomId, messageId }) => {
            await checkMessageHandler(roomId, messageId, socket, io);
        });

        socket.on('chat-deleted', async (chatId: string) => {
            await chatDeletedHandler(chatId, socket, io);
        });

        socket.on('chat-started', async (chatId: string) => {
            await chatStartedHandler(chatId, socket, io);
        });

        socket.on('delete-user', async (userId: string) => {
            await deleteUserHandler(userId, socket, io);
        });

        socket.on('disconnect', () => {
            disconnectHandler(socket, onlineList, io);
        });
    });

    return io;
};
