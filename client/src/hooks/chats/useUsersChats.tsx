import { useQuery } from '@tanstack/react-query';
import ChatService from '../../services/chatService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

const useUsersChats = () => {
    const userId = useSelector((state: RootState) => state.userReducer._id);
    return useQuery({
        queryKey: ['chats'],
        queryFn: () => ChatService.getUsersChats({ user: userId }),
        placeholderData: (previousData) => previousData,
    });
};

export default useUsersChats;
