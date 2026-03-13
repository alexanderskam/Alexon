import express from 'express';
import 'dotenv/config';
import router from './router/index.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { middleware } from './middlewares/error-middleware.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocket } from './socket/socket.js';

try {
    const PORT = process.env.PORT || 8000;
    const DB_URL = process.env.DB_URL || '';
    const CLIENT_URL = process.env.CLIENT_URL || '';

    console.log(DB_URL);

    const app = express();
    const httpServer = createServer(app);
    initSocket(httpServer, CLIENT_URL);

    app.use(express.json());
    app.use(cookieParser());
    app.use(
        cors({
            origin: CLIENT_URL,
            credentials: true,
        }),
    );
    app.use('/api', router);
    app.use(middleware);

    const start = async () => {
        try {
            await mongoose.connect(DB_URL);
            httpServer.listen(PORT, () => {
                console.log(`App is listening on port ${PORT}`);
            });
        } catch {
            console.log('Some error catched');
        }
    };

    start();
} catch (e) {
    console.log(e);
}
