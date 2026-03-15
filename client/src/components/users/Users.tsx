import { useContext, useState } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import useUsers from '../../hooks/users/useUsers';
import useStartChat from '../../hooks/chats/useStartChat';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { ToastContainer } from 'react-toastify';
import { SocketContext } from '../../context/SocketContext';

const Users = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [usersAmount, setUsersAmount] = useState<number>(50);
    const { data, isLoading, isPlaceholderData, error } = useUsers(
        username,
        email,
        usersAmount,
    );
    const userEmail = useSelector(
        (state: RootState) => state.userReducer.email,
    );
    const socketRef = useContext(SocketContext);
    const startChatMutation = useStartChat(socketRef);
    return (
        <div className="bg-blue-300 h-19/20 flex items-center justify-center flex-col">
            <div className="bg-[#2a2f3a] text-white h-9/10 w-5/10 border border-transparent rounded-2xl p-3 flex flex-col items-center">
                <div className="relative w-full">
                    <input
                        className="outline-none bg-[#35383d] w-full px-4 py-2 rounded-md  focus:border-sky-500 focus:bg-[#343b4a] focus:ring-2 focus:ring-sky-500/30"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Поиск..."
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <div className="w-px h-5 bg-white/30"></div>
                        <span className="text-white/60 text-sm whitespace-nowrap">
                            Username
                        </span>
                    </div>
                </div>
                <div className="relative w-full mt-2">
                    <input
                        className="outline-none bg-[#35383d] w-full px-4 py-2 rounded-md  focus:border-sky-500 focus:bg-[#343b4a] focus:ring-2 focus:ring-sky-500/30"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Поиск..."
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <div className="w-px h-5 bg-white/30"></div>
                        <span className="text-white/60 text-sm whitespace-nowrap">
                            E-mail
                        </span>
                    </div>
                </div>
                <hr className="my-4 w-full border-t border-white/20" />
                <div className="w-full flex flex-col  items-center overflow-y-auto min-h-0 custom-scrollbar">
                    {isLoading && <h2>Загрузка...</h2>}
                    {error && <h2>Возникла ошибка</h2>}
                    {!isLoading &&
                        !error &&
                        data &&
                        data.length > 0 &&
                        data.map((user) => {
                            if (user.email === userEmail) return <></>;
                            return (
                                <div
                                    key={user.email}
                                    className={`mb-2 flex justify-between items-center w-11/12 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#2f4e83] flex items-center justify-center text-white font-medium">
                                            {user.username.charAt(0)}
                                        </div>
                                        <strong>{user.username}</strong>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p>{user.email}</p>
                                        <FiMessageCircle
                                            className="w-6 h-6 cursor-pointer"
                                            onClick={() => {
                                                startChatMutation.mutate({
                                                    users: [
                                                        userEmail,
                                                        user.email,
                                                    ],
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    {!isLoading && !error && data && data.length > 0 && (
                        <h1
                            className="cursor-pointer text-blue-700"
                            onClick={() => setUsersAmount(usersAmount + 20)}
                        >
                            Загрузить ещё
                        </h1>
                    )}

                    {!isLoading && !error && (!data || data.length === 0) && (
                        <h1>Нет пользователей</h1>
                    )}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Users;
