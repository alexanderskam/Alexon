import { useMutation } from '@tanstack/react-query';
import AuthService from '../../services/authService';
import type { AxiosError } from 'axios';
import { toast } from 'react-toastify';

const useConfirm = (email: string) => {
    return useMutation<void, AxiosError, { userId: string }>({
        mutationFn: AuthService.confirmProfile,
        onSuccess: () => {
            toast.success(`Сообщение отправлено по адресу ${email}`);
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

export default useConfirm;
