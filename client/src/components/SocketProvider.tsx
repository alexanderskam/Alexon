import { Outlet } from 'react-router';
import { SocketContext } from '../context/SocketContext';
import useGlobalWebsocket from '../hooks/chats/socket/useGlobalWebsocket';
import { type FC } from 'react';

const SocketProvider: FC = () => {
    const socketRef = useGlobalWebsocket();
    return (
        <SocketContext.Provider value={socketRef}>
            <Outlet />
        </SocketContext.Provider>
    );
};

export default SocketProvider;
