import type { Request, Response, NextFunction } from 'express';
import userService from '../service/user-service.js';
import { validationResult } from 'express-validator';
import ApiError from '../exceptions/api-errors.js';

class UserControllers {
    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(
                    ApiError.BadRequest(
                        'Ошибка валидации, registration',
                        errors.array(),
                    ),
                );
            }
            const { username, email, password } = req.body;
            const userData = await userService.registration(
                username,
                email,
                password,
            );
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
            return res.status(200).json({
                user: userData.user,
                accessToken: userData.accessToken,
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(
                    ApiError.BadRequest(
                        'Ошибка валидации, login',
                        errors.array(),
                    ),
                );
            }
            const { email, password } = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
            return res.status(200).json({
                user: userData.user,
                accessToken: userData.accessToken,
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.cookies;
            await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            res.status(200).json({ message: 'success' });
        } catch (error) {
            next(error);
        }
    }

    async activate(
        req: Request<{ link: string }>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const clientUrl = process.env.CLIENT_URL + '/users';
            const activationLink = req.params.link;
            if (!activationLink) throw new Error('No activation link');
            if (!clientUrl) throw new Error('No client url');
            await userService.activate(activationLink);
            res.status(200).redirect(clientUrl);
        } catch (error) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
            return res.status(200).json({
                user: userData.user,
                accessToken: userData.accessToken,
            });
        } catch (error) {
            next(error);
        }
    }

    async getUsers(
        req: Request<
            {},
            {},
            {},
            { email: string; username: string; usersAmount: string }
        >,
        res: Response,
        next: NextFunction,
    ) {
        const controller = new AbortController();
        const { signal } = controller;
        req.on('close', () => {
            if (!res.headersSent) {
                controller.abort();
            }
        });
        try {
            const { email, username, usersAmount } = req.query;
            if (signal.aborted) return;
            const users = await userService.getUsers(
                email,
                username,
                parseInt(usersAmount, 10),
            );
            res.status(200).json(users);
        } catch (error) {
            if (
                error &&
                typeof error === 'object' &&
                'name' in error &&
                error.name === 'AbortError'
            )
                return;
            next(error);
        }
    }

    async checkAuth(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = req.cookies;
        const user = await userService.checkAuth(refreshToken);
        res.status(200).json({ user });
    }
}

export default new UserControllers();
