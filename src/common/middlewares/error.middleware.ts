import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/HttpException';

export function errorMiddleware(error: HttpException, request: Request, response: Response, next: NextFunction) {
    const status = error.status || 500;
    if (status === 500) {
        console.error(error);
    }
    const message =
        status === 500
            ? {
                  error_code: 500,
                  error_message: 'Something went wrong'
              }
            : error.message;
    response.status(status).send(message);
}
