import type { DefaultEventsMap } from '@socket.io/component-emitter';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';

const useUsersWebsocket = (
    socketRef: React.RefObject<Socket<
        DefaultEventsMap,
        DefaultEventsMap
    > | null> | null,
) => {
    const queryClient = useQueryClient();
    useEffect(() => {
        if (!socketRef) {
            console.log('no socket ref');
            return;
        }
        const socket = socketRef.current;
        if (!socket) return;

        socket.on('clean-users', () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        });

        return () => {
            socket.off('clean-users');
        };
    }, [socketRef, queryClient]);
};

export default useUsersWebsocket;
