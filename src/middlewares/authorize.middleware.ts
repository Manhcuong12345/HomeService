import { NextFunction, Request, Response } from 'express';
import { UNAUTHORIZED } from '../common/constants/err.constants';

/**
 * Function permission allow use to user
 * @param model
 * @param options
 * @returns
 */
export function authorize(roles?: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { user } = req;

        if (roles.includes(user.type)) {
            return next();
        }

        return res.status(401).send(UNAUTHORIZED);
    };
}
