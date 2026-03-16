import { useNavigate, useParams } from 'react-router';
import useUsersChats from '../../hooks/chats/useUsersChats';
import { useContext, type FC } from 'react';
import { GoPlus } from 'react-icons/go';
// import useWebsocket from '../../hooks/chats/useWebsocket';
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
    return (
        <div className="flex h-19/20">
            <div className="flex items-center flex-col w-2/8 border-r border-gray-300 overflow-y-auto bg-[#2a2f3a] text-white">
                <hr className="w-full border-t border-white/20" />
                {isLoading && <h2>Загрузка...</h2>}
                {error && <h2>Возникла ошибка</h2>}
                {!isLoading &&
                    !error &&
                    data &&
                    data.length > 0 &&
                    data.map((element) => {
                        return (
                            <ChatSelector
                                key={element.chat}
                                chat={element.chat}
                                friend={element.friend}
                                isPlaceholderData={isPlaceholderData}
                                socket={socket}
                                params={params}
                            />
                        );
                    })}
                <div
                    onClick={() => navigate('/users')}
                    className="flex text-blue-500 cursor-pointer gap-2 items-center mt-5"
                >
                    <GoPlus className="w-6 h-6" />
                    Начать общение
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-blue-300">
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
