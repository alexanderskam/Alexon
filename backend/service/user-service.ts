import { nanoid } from 'nanoid';
import { User } from '../models/user-model.js';
import bcrypt from 'bcrypt';
import mailService from './mail-service.js';
import tokenService from './token-service.js';
import ApiError from '../exceptions/api-errors.js';
import { Token } from '../models/token-model.js';
import type { Types } from 'mongoose';
import { Chat } from '../models/chat-model.js';
import { Message } from '../models/message-model.js';

class UserService {
    async registration(username: string, email: string, password: string) {
        const candidate = await User.findOne({ email });
        if (candidate) throw ApiError.BadRequest('Пользователь уже существует');
        const hashedPassword = await bcrypt.hash(password, 3);
        const activationLink = nanoid();
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            activationLink,
        });
        await mailService.sendActivationMail(
            email,
            `${process.env.API_URL}/api/activate/${activationLink}`,
        );
        const tokens = tokenService.generateTokens({
            email,
            id: user._id,
            isActivated: false,
        });
        await tokenService.saveToken(user._id, tokens.refreshToken);
        return {
            ...tokens,
            user: {
                username,
                email,
                id: user._id,
                isActivated: false,
            },
        };
    }
    async sendActivationMail(userId: string) {
        const user = await User.findById(userId);
        if (!user) throw ApiError.BadRequest('Пользователь не найден');
        const { email, activationLink } = user;
        await mailService.sendActivationMail(
            email,
            `${process.env.API_URL}/api/activate/${activationLink}`,
        );
    }
    async activate(activationLink: string) {
        const user = await User.findOne({ activationLink });
        if (!user) {
            throw ApiError.BadRequest('Неправильная ссылка активации');
        }
        user.isActivated = true;
        await user.save();
    }
    async login(email: string, password: string) {
        const user = await User.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest('Пользователь не был найден');
        }
        const isPassEq = await bcrypt.compare(password, user.password);
        if (!isPassEq) throw ApiError.BadRequest('Пароли не совпадают');
        const tokens = tokenService.generateTokens({
            email,
            id: user._id,
            isActivated: false,
        });
        await tokenService.saveToken(user._id, tokens.refreshToken);
        return {
            ...tokens,
            user: {
                username: user.username,
                email,
                id: user._id,
                isActivated: false,
            },
        };
    }
    async logout(refreshToken: string) {
        if (!refreshToken) throw ApiError.UnauthorizedError();
        await tokenService.removeToken(refreshToken);
    }
    async refresh(refreshToken: string) {
        if (!refreshToken) throw ApiError.UnauthorizedError();
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        console.log(userData, tokenFromDb);
        if (!userData || !tokenFromDb) throw ApiError.UnauthorizedError();
        const user = await User.findById(userData.id);
        console.log(user);
        if (!user) throw ApiError.UnauthorizedError();
        const tokens = tokenService.generateTokens({
            email: user.email,
            id: user._id,
            isActivated: false,
        });
        await tokenService.saveToken(user._id, tokens.refreshToken);
        return {
            ...tokens,
            user: {
                username: user.username,
                email: user.email,
                id: user._id,
                isActivated: false,
            },
        };
    }
    async getUsers(email: string, username: string, usersAmount: number) {
        const query: any = {};

        if (email) {
            query.email = { $regex: email, $options: 'i' };
        }

        if (username) {
            query.username = { $regex: username, $options: 'i' };
        }

        const users = await User.find(query).limit(usersAmount);
        return users;
    }
    async checkAuth(refreshToken: string) {
        const tokenData = await Token.findOne({ refreshToken });
        if (tokenData) {
            const user = User.findById(tokenData.user);
            return user;
        } else throw ApiError.BadRequest('Ошибка в хэндлере checkAuth');
    }
    async getUserIds(users: string[]) {
        const foundUsers = await User.find({ email: { $in: users } });

        if (foundUsers.length !== users.length) {
            throw ApiError.BadRequest(
                'Один или несколько пользователей не найдены',
            );
        }

        return foundUsers.map((user) => user._id);
    }
    async deleteUser(userId: string) {
        try {
            await User.findByIdAndDelete(userId);
            const chats = await Chat.find({ users: userId });
            await Chat.deleteMany({ users: userId });
            if (chats.length === 0) return;
            for (let i = 0; i < chats.length; i++) {
                const chatId = chats[i]?._id;
                if (!chatId) continue;
                await Message.deleteMany({ chatId: chatId });
            }
        } catch (error) {
            throw ApiError.BadRequest('Что-то пошло не так в попытке удаления');
        }
    }
}

export default new UserService();
