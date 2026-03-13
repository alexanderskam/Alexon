import { useQuery } from '@tanstack/react-query';
import { UserService } from '../../services/userService';

const useUsers = (username: string, email: string, usersAmount: number) => {
    return useQuery({
        queryKey: ['users', username, email, usersAmount],
        queryFn: ({ signal }) =>
            UserService.fetchUsers(username, email, usersAmount, signal),
        placeholderData: (previousData) => previousData,
    });
};

export default useUsers;
