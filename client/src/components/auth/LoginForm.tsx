import {
    useState,
    type ChangeEventHandler,
    type FC,
    type MouseEventHandler,
} from 'react';
import Input from '../../UI/Input';
import { useLogin } from '../../hooks/auth/useLogin';
import Button from '../../UI/Button';
import { useNavigate } from 'react-router';
import { ToastContainer } from 'react-toastify';

const LoginForm: FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();
    const loginMutation = useLogin();
    const changeEmailHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
        setEmail(e.target.value);
    };
    const changePasswordHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
        setPassword(e.target.value);
    };
    const loginHandler: MouseEventHandler<HTMLButtonElement> = () => {
        loginMutation.mutate({ email, password });
    };
    const canPushButton = () => {
        return !!email && !!password;
    };
    return (
        <div className="bg-blue-300 h-full flex items-center justify-center flex-col">
            <div className="flex w-full sm:w-1/2 p-2 h-1/2 flex-col items-end ">
                <Input
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
                        disabled={loginMutation.isPending || !canPushButton()}
                        onClick={loginHandler}
                    >
                        {loginMutation.isPending ? 'Загрузка...' : 'Войти'}
                    </Button>
                </div>
            </div>
            <p>
                Еще нет аккаунта?{' '}
                <span
                    className="text-blue-700 cursor-pointer"
                    onClick={() => navigate('/register')}
                >
                    Зарегистрироваться
                </span>{' '}
            </p>
            <ToastContainer />
        </div>
    );
};

export default LoginForm;
