import { useMutation } from '@tanstack/react-query';
import AuthService from '../../services/authService';
import type { AxiosError } from 'axios';
import type { ILoginResponse } from '../../types/authResponse';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { setUser } from '../../store/slices/userSlice';
import { toast } from 'react-toastify';

interface RegisterDto {
    username: string;
    email: string;
    password: string;
}

export const useRegister = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    return useMutation<ILoginResponse, AxiosError, RegisterDto>({
        mutationFn: AuthService.registration,
        onSuccess: (data) => {
            dispatch(setUser(data.user));
            localStorage.setItem('token', `${data.accessToken}`);
            navigate('/users');
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
