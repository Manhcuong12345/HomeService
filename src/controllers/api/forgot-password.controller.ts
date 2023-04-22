import { Response, Request, Router, NextFunction } from 'express';
import { Controller } from '../../common';
import { ForgotPasswordService } from '../../services/forgot-password.service';
import { rateLimiterRequest } from '../../middlewares/rate-limit-request.middleware';

export class ForgotPasswordController implements Controller {
    private readonly baseUrl: string = '/forgot-password';
    private _router: Router;
    private readonly forgotPasswordService = ForgotPasswordService.getInstance();

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    get router() {
        return this._router;
    }

    initRouter() {
        this._router.post(this.baseUrl + '/user', rateLimiterRequest(300, 5), this.forgotPasswordUser);
        this._router.post(this.baseUrl + '/tasker', rateLimiterRequest(300, 5), this.forgotPasswordTasker);
        this._router.post(this.baseUrl + '/admin', rateLimiterRequest(300, 5), this.forgotPasswordAdmin);
        this._router.post(this.baseUrl + '/user/check-email', this.checkEmailForSpam);
        this._router.post(this.baseUrl + '/tasker/check-email', this.checkEmailForSpamTasker);
        this._router.post(this.baseUrl + '/admin/check-email', this.checkEmailForSpamAdmin);
        this._router.post(this.baseUrl + '/verify-otp/user', this.checkOtpUser);
        this._router.post(this.baseUrl + '/verify-otp/tasker', this.checkOtpTasker);
        this._router.post(this.baseUrl + '/verify-otp/admin', this.checkOtpAdmin);
        this._router.put(this.baseUrl + '/reset-password/user', this.resetPasswordUser);
        this._router.put(this.baseUrl + '/reset-password/tasker', this.resetPasswordTasker);
        this._router.put(this.baseUrl + '/reset-password/admin', this.resetPasswordAdmin);
    }

    private forgotPasswordUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;

            res.send(await this.forgotPasswordService.forgotPasswordUser(email));
        } catch (err) {
            next(err);
        }
    };

    private forgotPasswordTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;

            res.send(await this.forgotPasswordService.forgotPasswordTasker(email));
        } catch (err) {
            next(err);
        }
    };

    private forgotPasswordAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            res.send(await this.forgotPasswordService.forgotPasswordAdmin(email));
        } catch (err) {
            next(err);
        }
    };

    private checkEmailForSpam = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;

            res.send(await this.forgotPasswordService.checkEmailForSpam(email));
        } catch (err) {
            next(err);
        }
    };

    private checkEmailForSpamTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;

            res.send(await this.forgotPasswordService.checkEmailForSpamTasker(email));
        } catch (err) {
            next(err);
        }
    };

    private checkEmailForSpamAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;

            res.send(await this.forgotPasswordService.checkEmailForSpamAdmin(email));
        } catch (err) {
            next(err);
        }
    };

    private checkOtpUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { otp } = req.body;

            res.send(await this.forgotPasswordService.checkOtpUser(otp));
        } catch (err) {
            next(err);
        }
    };

    private checkOtpTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { otp } = req.body;

            res.send(await this.forgotPasswordService.checkOtpTasker(otp));
        } catch (err) {
            next(err);
        }
    };

    private checkOtpAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { otp } = req.body;

            res.send(await this.forgotPasswordService.checkOtpAdmin(otp));
        } catch (err) {
            next(err);
        }
    };

    private resetPasswordUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, password } = req.body;

            res.send(await this.forgotPasswordService.resetPasswordUser(id, password));
        } catch (err) {
            next(err);
        }
    };

    private resetPasswordTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, password } = req.body;

            res.send(await this.forgotPasswordService.resetPasswordTasker(id, password));
        } catch (err) {
            next(err);
        }
    };

    private resetPasswordAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, password } = req.body;

            res.send(await this.forgotPasswordService.resetPasswordAdmin(id, password));
        } catch (err) {
            next(err);
        }
    };
}
