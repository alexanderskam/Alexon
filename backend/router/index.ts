import { Router } from 'express';
import UserControllers from '../controllers/user-controllers.js';
import { body } from 'express-validator';
import { middleware } from '../middlewares/auth-middleware.js';
import chatControllers from '../controllers/chat-controllers.js';

const router = Router();

// Временные обработчики для тестирования
router.post(
    '/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 4, max: 32 }),
    UserControllers.registration,
);

router.post(
    '/login',
    body('email').isEmail(),
    body('password').isLength({ min: 4, max: 32 }),
    UserControllers.login,
);

router.post('/logout', UserControllers.logout);

router.get('/activate/:link', UserControllers.activate);

router.get('/refresh', UserControllers.refresh);

router.get('/user', middleware, UserControllers.getUsers);

router.get('/check', middleware, UserControllers.checkAuth);

router.post('/chat', middleware, chatControllers.startChat);

router.get('/usersChats', middleware, chatControllers.getUsersChats);

export default router;
