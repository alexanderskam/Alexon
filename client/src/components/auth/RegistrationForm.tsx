import {
    useState,
    type ChangeEventHandler,
    type FC,
    type MouseEventHandler,
} from 'react';
import Input from '../../UI/Input';

import Button from '../../UI/Button';
import { useRegister } from '../../hooks/auth/useRegister';
import { useNavigate } from 'react-router';
import { ToastContainer } from 'react-toastify';

const RegistrationForm: FC = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();
    const registerMutation = useRegister();
    const changeEmailHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
        setEmail(e.target.value);
    };
    const changeUsernameHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
        setUsername(e.target.value);
    };
    const changePasswordHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
        setPassword(e.target.value);
    };
    const registerHandler: MouseEventHandler<HTMLButtonElement> = () => {
        registerMutation.mutate({ username, email, password });
    };
    const canPushButton = () => {
        return !!email && !!password && !!username;
    };
    return (
        <div className="bg-blue-300 h-full flex items-center justify-center flex-col">
            <div className="flex w-1/2 h-1/2 flex-col items-end">
                <Input
                    placeholder="Введите имя пользователя"
                    type="username"
                    value={username}
                    onChange={changeUsernameHandler}
                />
                <Input
                    className="mt-5"
                    placeholder="Введите электронную почту"
                    type="email"
                    value={email}
                    onChange={changeEmailHandler}
                />
                <Input
                    className="mt-5"
                    placeholder="Введите пароль"
                    type="password"
                    value={password}
                    onChange={changePasswordHandler}
                />
                <div className="mt-5">
                    <Button
                        disabled={
                            registerMutation.isPending || !canPushButton()
                        }
                        onClick={registerHandler}
                    >
                        {registerMutation.isPending
                            ? 'Загрузка...'
                            : 'Зарегистрироваться'}
                    </Button>
                </div>
            </div>
            <p>
                Уже есть аккаунт?{' '}
                <span
                    className="text-blue-700 cursor-pointer"
                    onClick={() => navigate('/login')}
                >
                    Войти
                </span>{' '}
            </p>
            <ToastContainer />
        </div>
    );
};

export default RegistrationForm;
