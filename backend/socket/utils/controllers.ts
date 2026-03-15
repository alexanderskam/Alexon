import type { DefaultEventsMap, ExtendedError, Socket } from 'socket.io';
import tokenService from '../../service/token-service.js';

type TSocket = Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
>;

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
