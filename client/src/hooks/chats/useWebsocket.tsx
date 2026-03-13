import axios from 'axios';
import type { IMessage } from '../../types/chat';
import { useEffect, useRef, useState, type ChangeEventHandler } from 'react';
import { io, Socket } from 'socket.io-client';
import type { RootState } from '../../store/store';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import type { ILoginResponse } from '../../types/authResponse';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

const useWebsocket = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const params = useParams<{
        id: string;
        friend: string;
    }>();
    const socketRef = useRef<Socket | null>(null);
    const [value, setValue] = useState<string>('');
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [onlineList, setOnlineList] = useState<string[]>([]);
    const [usersWithUnchecked, setUsersWithUnchecked] = useState<string[]>([]);
    const userId = useSelector((state: RootState) => state.userReducer._id);
    const [connectState, setConnectState] = useState<boolean>(false);

    useEffect(() => {
        const socket = io('http://localhost:3000', {
            withCredentials: true,
            auth: {
                accessToken: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setConnectState(true);
        });

        socket.on('connect_error', async (err) => {
            if (err.message === 'Unauthorized') {
                try {
                    const response = await axios.get<ILoginResponse>(
                        'http://localhost:3000/api/refresh',
                        { withCredentials: true },
                    );
                    localStorage.setItem('token', response.data.accessToken);
                    socket.auth = {
                        accessToken: `Bearer ${response.data.accessToken}`,
                    };
                    socket.connect();
                } catch {
                    console.log('refresh failed');
                }
            }
        });

        socket.on('online-list', (users: string[]) => {
            setOnlineList(users);
        });

        socket.on('unchecked-messages', (unchecked: string[]) => {
            console.log('unchecked: ', unchecked);
            setUsersWithUnchecked(unchecked);
        });

        return () => {
            console.log('disconnect');
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !params.id) return;
        console.log('PARAM: ', params.id);

        socket.on('connect', () => {
            //КОСТЫЫЫЛЬ
            setTimeout(() => {
                console.log('connected, joining room', params.id);
                socket.emit('join-room', params.id);
            }, 370);
        });

        socket.on('message', (message: IMessage) => {
            if (message.chatId !== params.id) return;
            setMessages((prev) => [...prev, message]);
        });

        socket.on('delete-message', (id: string) => {
            setMessages((prev) => {
                return prev.filter((message) => message._id !== id);
            });
        });

        socket.on('chat-history', (data: IMessage[]) => {
            setMessages(data);
        });

        socket.on('error', (error: string) => {
            toast.error(error);
        });

        socket.on('typing', () => {
            setIsTyping(true);
        });

        socket.on('stop-typing', () => {
            setIsTyping(false);
        });

        socket.on('check-message', (messageId) => {
            console.log('check-message');
            setMessages((prev) =>
                prev.map((message) => {
                    return message._id === messageId
                        ? { ...message, isChecked: true }
                        : message;
                }),
            );
        });

        socket.on('chat-deleted', (chatId: string) => {
            console.log(params.id + ' ' + chatId);
            if (params.id == chatId) navigate('/chats');
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        });

        console.log('connected, joining room', params.id);
        socket.emit('join-room', params.id);

        return () => {
            socket.emit('leave-room');
            socket.off('connect');
            socket.off('message');
            socket.off('delete-message');
            socket.off('chat-history');
            socket.off('error');
            socket.off('typing');
            socket.off('stop-typing');
            socket.off('check-message');
            socket.off('chat-deleted');
        };
    }, [params.id, connectState, navigate, queryClient]);

    const sendMessage = () => {
        socketRef.current?.emit('message', {
            roomId: params.id,
            message: {
                createdAt: new Date(),
                body: value,
                chatId: params.id,
            },
        });
        setValue('');
    };

    const deleteMessage = (id: string) => {
        socketRef.current?.emit('delete-message', {
            roomId: params.id,
            id: id,
        });
    };

    const changeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
        socketRef.current?.emit('typing', params.id);
        setValue(e.target.value);
    };

    const checkMessageHandler = (id: string) => {
        socketRef.current?.emit('check-message', {
            roomId: params.id,
            messageId: id,
        });
    };

    const handleChatDeleting = (chatId: string) => {
        socketRef.current?.emit('chat-deleted', chatId);
    };

    return {
        sendMessage,
        changeHandler,
        messages,
        value,
        userId,
        deleteMessage,
        isTyping,
        onlineList,
        checkMessageHandler,
        usersWithUnchecked,
        handleChatDeleting,
    };
};

export default useWebsocket;
