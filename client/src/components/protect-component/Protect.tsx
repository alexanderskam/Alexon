import { useEffect, useState, type FC, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../http';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { setUser } from '../../store/slices/userSlice';

interface IProtectProps {
    children: ReactNode;
}

const Protect: FC<IProtectProps> = ({ children }) => {
    const [status, setStatus] = useState<
        'loading' | 'authenticated' | 'unauthenticated'
    >('loading');
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await api.get('/check');
                console.log(user.data);
                dispatch(setUser(user.data.user));
                setStatus('authenticated');
            } catch {
                setStatus('unauthenticated');
            }
        };

        checkAuth();
    }, [dispatch]);

    if (status === 'loading')
        return (
            <div className="bg-blue-300 h-19/20 flex items-center justify-center flex-col">
                Загрузка...
            </div>
        );

    if (status === 'unauthenticated') {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default Protect;
