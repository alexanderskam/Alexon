import axios from 'axios';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ILoginResponse } from '../../../types/authResponse';

const useGlobalWebsocket = () => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io('https://alexon.onrender.com', {
            //https://alexon.onrender.com
            //http://localhost:3000
            withCredentials: true,
            auth: {
                accessToken: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected');
        });

        socket.on('connect_error', async (err) => {
            if (err.message === 'Unauthorized') {
                try {
                    const response = await axios.get<ILoginResponse>(
                        'https://alexon.onrender.com/api/refresh',
                        { withCredentials: true },
                    );
                    localStorage.setItem('token', response.data.accessToken);
                    socket.auth = {
                        accessToken: `Bearer ${response.data.accessToken}`,
                    };
                    socket.connect();
                } catch {
                    console.log('refresh failed');
                }
            }
        });

        return () => {
            console.log('Socket disconnected');
            socket.disconnect();
        };
    }, []);

    return socketRef;
};

export default useGlobalWebsocket;
