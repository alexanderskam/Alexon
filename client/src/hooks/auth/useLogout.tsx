import { useMutation, useQueryClient } from '@tanstack/react-query';
import AuthService from '../../services/authService';
import type { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../../store/store';
import { setUser } from '../../store/slices/userSlice';

const useLogout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const dispatch = useDispatch<AppDispatch>();
    return useMutation<{ message: string }, AxiosError>({
        mutationFn: AuthService.logout,
        onSuccess: () => {
            queryClient.clear();
            dispatch(
                setUser({
                    username: '',
                    email: '',
                    _id: '',
                    isActivated: false,
                }),
            );
            navigate('/login');
        },
        onError: (error) => {
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

export default useLogout;
