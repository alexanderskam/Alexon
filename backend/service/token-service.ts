import jwt from 'jsonwebtoken';
import { Token } from '../models/token-model.js';
import type { Types } from 'mongoose';
import ApiError from '../exceptions/api-errors.js';

interface JwtPayload {
    email: string;
    id: Types.ObjectId;
    isActivated: boolean;
}

class TokenService {
    generateTokens(payload: {
        email: string;
        id: Types.ObjectId;
        isActivated: boolean;
    }) {
        const accessSecret = process.env.ACCESS_SECRET_KEY;
        const refreshSecret = process.env.REFRESH_SECRET_KEY;
        if (!accessSecret || !refreshSecret) {
            throw ApiError.BadRequest('JWT не определены');
        }
        const accessToken = jwt.sign(payload, accessSecret, {
            expiresIn: '15m',
        });
        const refreshToken = jwt.sign(payload, refreshSecret, {
            expiresIn: '30d',
        });
        return { accessToken, refreshToken };
    }
    async saveToken(userId: Types.ObjectId, refreshToken: string) {
        const tokenData = await Token.findOne({ user: userId });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            await tokenData.save();
            return;
        }
        await Token.create({
            user: userId,
            refreshToken: refreshToken,
        });
    }
    async removeToken(refreshToken: string) {
        try {
            await Token.deleteOne({ refreshToken });
        } catch {
            throw ApiError.BadRequest('Токен не найден');
        }
    }
    validateAccessToken(token: string) {
        try {
            const secret = process.env.ACCESS_SECRET_KEY;
            if (!secret) throw new Error('Нет секрета, access');
            const userData = jwt.verify(token, secret) as JwtPayload;
            return userData;
        } catch (error) {
            console.log(error);
        }
    }
    validateRefreshToken(token: string) {
        try {
            const secret = process.env.REFRESH_SECRET_KEY;
            if (!secret) throw new Error('Нет секрета, refresh');
            const userData = jwt.verify(token, secret) as JwtPayload;
            return userData;
        } catch (error) {
            console.log(error);
        }
    }
    async findToken(token: string) {
        const tokenData = await Token.findOne({ refreshToken: token });
        return tokenData;
    }
}

export default new TokenService();
