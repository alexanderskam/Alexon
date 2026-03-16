import type {
    DefaultEventsMap,
    ExtendedError,
    Server,
    Socket,
} from 'socket.io';
import tokenService from '../../service/token-service.js';
import { uncheckedMessagesFinder } from './uncheckedMessagesFinder.js';
import { checkUserInChat } from './checker.js';
import { Message } from '../../models/message-model.js';
import { Chat } from '../../models/chat-model.js';
import { User } from '../../models/user-model.js';

type TSocket = Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
>;

type TIo = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

type TOnlineList = Set<string>;

export const socketMiddleware = async (
    socket: TSocket,
    next: (err?: ExtendedError | undefined) => void,
) => {
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
};

export const connectionHandler = (
    socket: TSocket,
    onlineList: TOnlineList,
    io: TIo,
) => {
    console.log('user connected:', socket.data.senderId);
    onlineList.add(socket.data.senderId);
    io.emit('online-list', [...onlineList]);
    // const uncheckedMessages = await uncheckedMessagesFinder(
    //     socket.data.senderId.toString(),
    // );
    // console.log('UNCHECKED: ', uncheckedMessages);
    // socket.emit('unchecked-messages', [...uncheckedMessages]);
    socket.join(socket.data.senderId);
};

export const getFirstInfoHandler = async (
    io: TIo,
    onlineList: TOnlineList,
    socket: TSocket,
) => {
    io.emit('online-list', [...onlineList]);
    const uncheckedMessages = await uncheckedMessagesFinder(
        socket.data.senderId.toString(),
    );
    console.log('UNCHECKED: ', uncheckedMessages);
    socket.emit('unchecked-messages', [...uncheckedMessages]);
};

export const joinRoomHandler = async (roomId: string, socket: TSocket) => {
    const allowed = await checkUserInChat(socket, socket.data.senderId, roomId);
    if (!allowed) return;
    socket.join(roomId);
    const messages = await Message.find({ chatId: roomId }).sort({
        createdAt: 1,
    });
    if (!messages) socket.emit('chat-history', []);
    socket.emit('chat-history', messages);
    console.log(`socket ${socket.id} joined ${roomId}`);
};

export const leaveRoomHandler = (socket: TSocket) => {
    for (const room of socket.rooms) {
        if (room !== socket.id && room !== socket.data.senderId) {
            socket.leave(room);
        }
    }
};

export const messageHandler = async (
    roomId: string,
    message: { chatId: string; body: string; createdAt: string },
    socket: TSocket,
    io: TIo,
) => {
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
        const uncheckedMessages = await uncheckedMessagesFinder(consumer);
        // console.log('USER: ', socket.data.senderId);
        // console.log('ROOMS: ', socket.rooms);
        // console.log('UNCHECKED: ', uncheckedMessages);
        // console.log('CONSUMER: ', consumer);
        io.to(consumer.toString()).emit('unchecked-messages', [
            ...uncheckedMessages,
        ]);
    }
};

export const deleteMessageHandler = async (
    roomId: string,
    id: string,
    socket: TSocket,
    io: TIo,
) => {
    const message = await Message.findByIdAndDelete(id);
    if (message) io.to(roomId).emit('delete-message', id);
    else io.to(roomId).emit('error', 'Ошибка удаления сообщения');
    const chat = await Chat.findById(roomId);
    const consumer = chat?.users
        .find((user) => user.toString() !== socket.data.senderId)
        ?.toString();
    if (consumer) {
        const uncheckedMessages = await uncheckedMessagesFinder(consumer);
        // console.log('USER: ', socket.data.senderId);
        // console.log('ROOMS: ', socket.rooms);
        // console.log('UNCHECKED: ', uncheckedMessages);
        // console.log('CONSUMER: ', consumer);
        io.to(consumer.toString()).emit('unchecked-messages', [
            ...uncheckedMessages,
        ]);
    }
};

export const typingHandler = (roomId: string, socket: TSocket) => {
    socket.to(roomId).emit('typing');
};

export const checkMessageHandler = async (
    roomId: string,
    messageId: string,
    socket: TSocket,
    io: TIo,
) => {
    console.log('check-message');
    await Message.findByIdAndUpdate(messageId, { isChecked: true });
    socket.to(roomId).emit('check-message', messageId);
    const uncheckedMessages = await uncheckedMessagesFinder(
        socket.data.senderId,
    );
    io.to(socket.data.senderId).emit('unchecked-messages', [
        ...uncheckedMessages,
    ]);
};

export const chatDeletedHandler = async (
    chatId: string,
    socket: TSocket,
    io: TIo,
) => {
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
};

export const chatStartedHandler = async (
    chatId: string,
    socket: TSocket,
    io: TIo,
) => {
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
};

export const deleteUserHandler = async (
    userId: string,
    socket: TSocket,
    io: TIo,
) => {
    try {
        console.log('TRYING TO DELETE');
        await User.findByIdAndDelete(userId);
        const chats = await Chat.find({ users: userId });
        await Chat.deleteMany({ users: userId });
        if (chats.length > 0) {
            for (let i = 0; i < chats.length; i++) {
                const chatId = chats[i]?._id;
                if (!chatId) continue;
                await Message.deleteMany({ chatId: chatId });
                const userToEmit = chats[i]?.users.find(
                    (user) =>
                        user.toString() !== socket.data.senderId.toString(),
                );
                if (userToEmit) {
                    io.to(userToEmit.toString()).emit(
                        'chat-deleted',
                        chats.find((chat) => {
                            return (
                                chat.users.includes(userToEmit) &&
                                chat.users.includes(socket.data.senderId)
                            );
                        })?._id,
                    );
                }
            }
        }
        console.log('USER DELETED');
        io.to(socket.data.senderId.toString()).emit('user-deleted');
        io.emit('clean-users');
    } catch (error) {
        console.log('ERROR');
        io.to(socket.data.senderId.toString()).emit(
            'error',
            'Ошибка удаления пользователя',
        );
    }
};

export const disconnectHandler = (
    socket: TSocket,
    onlineList: TOnlineList,
    io: TIo,
) => {
    onlineList.delete(socket.data.senderId);
    io.emit('online-list', [...onlineList]);
    console.log('user disconnected:', socket.id);
};
