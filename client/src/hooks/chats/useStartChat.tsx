import { useMutation } from '@tanstack/react-query';
import ChatService from '../../services/chatService';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import type { Socket } from 'socket.io-client';

const useStartChat = (socketRef: React.RefObject<Socket | null> | null) => {
    const navigate = useNavigate();
    return useMutation<
        { _id: string; users: string[] },
        AxiosError,
        {
            users: string[];
        }
    >({
        mutationFn: ChatService.startChat,
        onMutate: () => {
            toast.loading('Загрузка...', {
                toastId: 'start-chat',
                closeButton: false,
                closeOnClick: false,
                draggable: false,
            });
        },
        onSuccess: (data) => {
            if (socketRef) socketRef.current?.emit('chat-started', data._id);
            toast.dismiss('start-chat');
            navigate(`/chats/${data._id}`);
        },
        onError: (error) => {
            toast.dismiss('start-chat');
            if (error.response && error.response.data) {
                const data: unknown = error.response.data;
                if (data && typeof data === 'object' && 'message' in data) {
                    const message = (data as { message: string }).message;
                    toast.error(message);
                }
            } else toast.error('Возникла непредвиденная ошибка!');
        },
    });
};

export default useStartChat;
