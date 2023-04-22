import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_REQUEST } from '../common/constants/err.constants';
import { HttpException } from '../common';
import { NextFunction, Request, Response } from 'express';
import { redisClient } from '../databases/redis_cloud';

//Function check limit request user
function rateLimiterRequest(secondsWindow: number, allowedHits: number) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const { email } = req.body;
        const requests = await redisClient.incr(email);

        let ttl;
        //if using request == 1 then culate time
        if (requests === 1) {
            await redisClient.expire(email, secondsWindow);
            ttl = secondsWindow;
        } else {
            ttl = redisClient.ttl(email);
        }

        if (requests > allowedHits) {
            res.status(429).send({
                error_code: '1024',
                error_message: 'You have exceeded 5 requests in the limit and have to wait another 24h to come back!'
            });
        } else {
            next();
        }
    };
}

//function rate limit request to client to many req then infomation error
const rateLimitRequestUser = rateLimit({
    windowMs: 5 * 60 * 1000, // 24h
    max: 5,
    legacyHeaders: true,
    standardHeaders: false,
    headers: true,
    skipFailedRequests: true, // Do not count failed requests (status >= 400)
    skipSuccessfulRequests: false, // Do not count successful requests (status < 400)
    requestWasSuccessful: (req: Request, res: Response): boolean => req.statusCode < 400,
    skip: (req: Request, res: Response): boolean => false,
    handler: (request, response, next) => {
        throw new HttpException(429, RATE_LIMIT_REQUEST);
    }
});

const rateLimitRequestTasker = rateLimit({
    windowMs: 5 * 60 * 1000, // 24h
    max: 5,
    legacyHeaders: true,
    standardHeaders: false,
    headers: true,
    skipFailedRequests: true, // Do not count failed requests (status >= 400)
    skipSuccessfulRequests: false, // Do not count successful requests (status < 400)
    requestWasSuccessful: (req: Request, res: Response): boolean => req.statusCode < 400,
    skip: (req: Request, res: Response): boolean => false,
    handler: (request, response, next) => {
        throw new HttpException(429, RATE_LIMIT_REQUEST);
    }
});

const rateLimitRequestAdmin = rateLimit({
    windowMs: 5 * 60 * 1000, // 24h
    max: 5,
    legacyHeaders: true,
    standardHeaders: false,
    headers: true,
    skipFailedRequests: true, // Do not count failed requests (status >= 400)
    skipSuccessfulRequests: false, // Do not count successful requests (status < 400)
    requestWasSuccessful: (req: Request, res: Response): boolean => req.statusCode < 400,
    skip: (req: Request, res: Response): boolean => false,
    handler: (request, response, next) => {
        throw new HttpException(429, RATE_LIMIT_REQUEST);
    }
});

export { rateLimiterRequest };
export { rateLimitRequestUser };
export { rateLimitRequestTasker };
export { rateLimitRequestAdmin };
