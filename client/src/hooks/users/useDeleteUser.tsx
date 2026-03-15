import type { DefaultEventsMap } from '@socket.io/component-emitter';
import type { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../../store/store';
import { setUser } from '../../store/slices/userSlice';
import { useNavigate } from 'react-router';

const useDeleteUser = (
    socketRef: React.RefObject<Socket<
        DefaultEventsMap,
        DefaultEventsMap
    > | null> | null,
) => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    useEffect(() => {
        if (!socketRef) return;
        const socket = socketRef.current;
        if (!socket) return;
        socket.on('user-deleted', () => {
            queryClient.clear();
            dispatch(
                setUser({
                    username: '',
                    email: '',
                    _id: '',
                    isActivated: false,
                }),
            );
            navigate('/register');
        });
        socket.on('error', (message: string) => {
            toast.error(message);
        });
        return () => {
            socket.off('error');
            socket.off('user-deleted');
        };
    }, [dispatch, navigate, queryClient, socketRef]);

    const handleDeleteUser = (userId: string) => {
        if (socketRef && socketRef.current) {
            socketRef.current.emit('delete-user', userId);
        }
    };

    return handleDeleteUser;
};

export default useDeleteUser;
