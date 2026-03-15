import Input from '../../UI/Input';
import Button from '../../UI/Button';
import Message from './Message';
import useChatWebsocket from '../../hooks/chats/socket/useChatWebsocket';
import { useEffect, useRef, type FC } from 'react';
import { ToastContainer } from 'react-toastify';
import typing from '../../assets/3-dots-move.svg';

type IProps = ReturnType<typeof useChatWebsocket>;

const Chat1: FC<IProps> = ({ ...props }) => {
    const {
        sendMessage,
        changeHandler,
        messages,
        value,
        userId,
        deleteMessage,
        isTyping,
        checkMessageHandler,
    } = props;
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex w-full flex-col bg-[#2a2f3a] text-gray-300">
                <hr className="w-full border-t border-white/20" />
            </div>
            <div className="h-full overflow-y-auto min-h-0 custom-scrollbar-chat">
                {messages.map((message) => {
                    return (
                        <Message
                            key={message._id}
                            onDelete={deleteMessage}
                            _id={message._id}
                            fromMe={userId === message.from ? true : false}
                            text={message.body}
                            date={message.createdAt}
                            isChecked={message.isChecked}
                            onCheck={checkMessageHandler}
                        />
                    );
                })}
                <div ref={bottomRef} />
                {isTyping && (
                    <div className="absolute bottom-13 left-2">
                        <img
                            src={typing}
                            alt="печатает..."
                            className="w-6 h-6"
                        />
                    </div>
                )}
            </div>
            <div className="flex w-full gap-2 p-2">
                <Input
                    type="text"
                    placeholder="Введите сообщение"
                    value={value}
                    onChange={changeHandler}
                />
                <Button onClick={sendMessage}>Отправить</Button>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Chat1;
