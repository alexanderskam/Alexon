import { useState, type FC } from 'react';
import { useNavigate, type Params } from 'react-router';
import type { IMessage } from '../../types/chat';
import Menu from './Menu';

interface IProps {
    chat: string;
    friend: {
        _id: string;
        email: string;
        username: string;
    };
    isPlaceholderData: boolean;
    socket: {
        sendMessage: () => void;
        changeHandler: React.ChangeEventHandler<HTMLInputElement>;
        messages: IMessage[];
        value: string;
        userId: string;
        deleteMessage: (id: string) => void;
        isTyping: boolean;
        onlineList: string[];
        checkMessageHandler: (id: string) => void;
        usersWithUnchecked: string[];
        handleChatDeleting: (chatId: string) => void;
    };
    onClickMobileClose: () => void;
    params: Readonly<Params<string>>;
}

const ChatSelector: FC<IProps> = ({ ...props }) => {
    const element = { chat: props.chat, friend: props.friend };
    const isPlaceholderData = props.isPlaceholderData;
    const socket = props.socket;
    const params = props.params;
    const navigate = useNavigate();
    const [menu, setMenu] = useState<{
        x: number;
        y: number;
        chatId: string;
    }>();
    const [menuState, setMenuState] = useState<boolean>(false);
    const handleMoveOtherChat = (chatId: string) => {
        navigate(`/chats/${chatId}`);
    };
    return (
        <div
            onClick={() => {
                handleMoveOtherChat(element.chat);
                props.onClickMobileClose();
            }}
            className={`flex text-gray-300 cursor-pointer justify-between items-center w-full ${isPlaceholderData ? 'opacity-50' : 'opacity-100'} hover:bg-gray-700 hover:shadow-md transition-colors duration-200 rounded-md ${params.id == element.chat ? 'bg-white/5' : ''}`}
            onContextMenu={(e) => {
                e.preventDefault();
                setMenu({
                    x: e.clientX,
                    y: e.clientY,
                    chatId: element.chat,
                });
                setMenuState(true);
            }}
        >
            <div className="flex flex-col w-full">
                <div className="flex gap-4 items-center ml-2 ">
                    <div className="w-10 h-10 rounded-full bg-[#2f4e83] flex items-center justify-center text-white font-medium mt-2 mb-2 ">
                        {element.friend.username.charAt(0)}
                    </div>
                    <strong>{element.friend.username}</strong>
                    <div className="flex gap-1 ml-auto">
                        {socket.usersWithUnchecked.includes(
                            element.friend._id,
                        ) ? (
                            <div className=" bg-blue-500 px-1 py-1 rounded ml-auto mr-3"></div>
                        ) : (
                            <></>
                        )}
                        {socket.onlineList.includes(element.friend._id) ? (
                            <div className=" bg-green-500 px-1 py-1 rounded ml-auto mr-3"></div>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                <hr className="w-full border-t border-white/10" />
            </div>
            {menuState && menu ? (
                <Menu menu={menu} setMenuState={setMenuState} socket={socket} />
            ) : (
                <></>
            )}
        </div>
    );
};

export default ChatSelector;
