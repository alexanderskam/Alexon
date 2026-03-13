import { useEffect, type FC } from 'react';
import type { IMessage } from '../../types/chat';

interface IProps {
    menu: {
        x: number;
        y: number;
        chatId: string;
    };
    setMenuState: React.Dispatch<React.SetStateAction<boolean>>;
    socket: {
        sendMessage: () => void;
        changeHandler: React.ChangeEventHandler<HTMLInputElement, Element>;
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
}

const Menu: FC<IProps> = ({ ...props }) => {
    const { menu, setMenuState } = props;
    const socket = props.socket;

    useEffect(() => {
        const close = () => setMenuState(false);
        window.addEventListener('click', close);

        return () => window.removeEventListener('click', close);
    }, [setMenuState]);
    return (
        <div
            style={{
                position: 'fixed',
                top: menu.y,
                left: menu.x,
            }}
            className="bg-gray-900 border border-gray-700 rounded shadow-lg z-50"
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    socket.handleChatDeleting(menu.chatId);
                    setMenuState(false);
                }}
                className="block px-4 py-2 hover:bg-red-600 w-full text-left"
            >
                Удалить чат
            </button>
        </div>
    );
};

export default Menu;
