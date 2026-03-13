import type { Request, Response, NextFunction } from 'express';
import ApiError from '../exceptions/api-errors.js';
import tokenService from '../service/token-service.js';

export const middleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorisationHeader = req.headers.authorization;
        if (!authorisationHeader) return next(ApiError.UnauthorizedError());
        const accessToken = authorisationHeader.split(' ')[1];
        if (!accessToken) return next(ApiError.UnauthorizedError());
        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) return next(ApiError.UnauthorizedError());
        (req as any).user = userData;
        next();
    } catch (error) {
        console.log('catch');
        return next(ApiError.UnauthorizedError());
    }
};
