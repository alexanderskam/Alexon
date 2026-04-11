import { useNavigate, useParams } from 'react-router';
import useUsersChats from '../../hooks/chats/useUsersChats';
import { useContext, useState, type FC } from 'react';
import { GoPlus } from 'react-icons/go';
import { FiMenu } from 'react-icons/fi';
import Chat from './Chat';
import ChatSelector from './ChatSelector';
import { SocketContext } from '../../context/SocketContext';
import useChatWebsocket from '../../hooks/chats/socket/useChatWebsocket';

interface IProps {
    withChat: boolean;
}

const MainPage: FC<IProps> = ({ ...props }) => {
    const { data, isLoading, isPlaceholderData, error } = useUsersChats();
    const navigate = useNavigate();
    const params = useParams();
    const { withChat } = props;

    const globalSocketRef = useContext(SocketContext);
    const socket = useChatWebsocket(globalSocketRef);

    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-19/20 relative">
            <button
                className="md:hidden absolute top-2 left-2 z-50 bg-gray-800 text-white p-2 rounded"
                onClick={() => setSidebarOpen(true)}
            >
                <FiMenu size={20} />
            </button>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div
                className={`
                    fixed md:static z-50 md:z-auto
                    top-0 left-0 h-full
                    w-3/4 sm:w-2/5 md:w-2/8
                    bg-[#2a2f3a] text-white border-r border-gray-300
                    transform transition-transform duration-300
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                    flex flex-col overflow-y-auto
                `}
            >
                <hr className="w-full border-t border-white/20" />

                {isLoading && <h2>Загрузка...</h2>}
                {error && <h2>Возникла ошибка</h2>}

                {!isLoading &&
                    !error &&
                    data &&
                    data.length > 0 &&
                    data.map((element) => (
                        <ChatSelector
                            key={element.chat}
                            chat={element.chat}
                            friend={element.friend}
                            isPlaceholderData={isPlaceholderData}
                            socket={socket}
                            params={params}
                            onClickMobileClose={() => setSidebarOpen(false)}
                        />
                    ))}

                <div
                    onClick={() => {
                        navigate('/users');
                        setSidebarOpen(false);
                    }}
                    className="flex text-blue-500 cursor-pointer gap-2 items-center mt-5 p-3 w-full justify-center"
                >
                    <GoPlus className="w-6 h-6" />
                    Начать общение
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-blue-300 w-full">
                {withChat ? (
                    <Chat {...socket} />
                ) : (
                    <p className="w-full text-center mt-4">
                        <strong className="text-2xl cursor-default text-gray-700">
                            Откройте чат
                        </strong>
                    </p>
                )}
            </div>
        </div>
    );
};

export default MainPage;
