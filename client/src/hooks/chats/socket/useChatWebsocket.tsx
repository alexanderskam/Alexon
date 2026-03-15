import type { IMessage } from '../../../types/chat';
import { useEffect, useState, type ChangeEventHandler } from 'react';
import { Socket } from 'socket.io-client';
import type { RootState } from '../../../store/store';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import type { DefaultEventsMap } from '@socket.io/component-emitter';

const useChatWebsocket = (
    socketRef: React.RefObject<Socket<
        DefaultEventsMap,
        DefaultEventsMap
    > | null> | null,
) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const params = useParams<{
        id: string;
        friend: string;
    }>();
    const [value, setValue] = useState<string>('');
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [onlineList, setOnlineList] = useState<string[]>([]);
    const [usersWithUnchecked, setUsersWithUnchecked] = useState<string[]>([]);
    const userId = useSelector((state: RootState) => state.userReducer._id);

    useEffect(() => {
        if (!socketRef) {
            console.log('no socket ref');
            return;
        }
        const socket = socketRef.current;
        if (!socket) return;

        socket.on('online-list', (users: string[]) => {
            setOnlineList(users);
        });

        socket.on('unchecked-messages', (unchecked: string[]) => {
            setUsersWithUnchecked(unchecked);
        });

        socket.on('chat-started', () => {
            console.log('chat started');
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        });

        socket.emit('get-first-info');

        return () => {
            socket.off('online-list');
            socket.off('unchecked-messages');
            socket.off('chat-started');
        };
    }, [socketRef, queryClient]);

    useEffect(() => {
        if (!socketRef) {
            console.log('no socket ref');
            return;
        }
        const socket = socketRef.current;
        if (!socket) return;

        socket.off('chat-deleted');

        socket.on('chat-deleted', (chatId: string) => {
            console.log('deleting chat: ' + params.id + ' ' + chatId);
            if (params.id) {
                if (params.id == chatId) {
                    navigate('/chats');
                }
            }
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        });

        if (!params.id) return;

        if (socket.connected) {
            socket.emit('join-room', params.id);
        } else {
            socket.once('connect', () => {
                socket.emit('join-room', params.id);
            });
        }

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
            setMessages((prev) =>
                prev.map((message) => {
                    return message._id === messageId
                        ? { ...message, isChecked: true }
                        : message;
                }),
            );
        });

        return () => {
            socket.emit('leave-room');
            setMessages([]);
            socket.off('chat-deleted');
            socket.off('connect');
            socket.off('message');
            socket.off('delete-message');
            socket.off('chat-history');
            socket.off('error');
            socket.off('typing');
            socket.off('stop-typing');
            socket.off('check-message');
        };
    }, [params.id, navigate, queryClient, socketRef]);

    const sendMessage = () => {
        if (!socketRef) {
            console.log('no socket ref');
            return;
        }
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
        if (!socketRef) {
            console.log('no socket ref');
            return;
        }
        socketRef.current?.emit('delete-message', {
            roomId: params.id,
            id: id,
        });
    };

    const changeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
        if (!socketRef) {
            console.log('no socket ref');
            return;
        }
        socketRef.current?.emit('typing', params.id);
        setValue(e.target.value);
    };

    const checkMessageHandler = (id: string) => {
        if (!socketRef) {
            console.log('no socket ref');
            return;
        }
        socketRef.current?.emit('check-message', {
            roomId: params.id,
            messageId: id,
        });
    };

    const handleChatDeleting = (chatId: string) => {
        if (!socketRef) {
            console.log('no socket ref');
            return;
        }
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

export default useChatWebsocket;
