import { Response, Request, NextFunction } from 'express';
import { config } from '../config/config';
import { UNAUTHORIZED, TOKEN_EXPIRED } from '../common/constants/err.constants';
import jwt from 'jsonwebtoken';

export async function auth(req: Request, res: Response, next: NextFunction) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send(UNAUTHORIZED);

    try {
        const payload = jwt.verify(token, config.get('jwtKey')) as any;
        req.user = payload;
        req.body.user_created = req.body.user_updated = payload._id;

        next();
    } catch (ex) {
        console.log(ex.message);
        return res.status(401).send(TOKEN_EXPIRED);
    }
}
