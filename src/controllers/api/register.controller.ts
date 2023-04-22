import { Response, Request, Router, NextFunction } from 'express';
import { Controller } from '../../common';
import { RegisterService } from '../../services/register.service';

export class RegisterController implements Controller {
    private readonly baseUrl: string = '/registers';
    private _router: Router;
    private readonly registerService = RegisterService.getInstance();

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    get router() {
        return this._router;
    }

    initRouter() {
        this._router.put(this.baseUrl + '/user', this.registerUser);
        this._router.post(this.baseUrl + '/user/email', this.checkEmailRegister);
        this._router.post(this.baseUrl + '/user/verify-otp', this.checkOtpUser);
        this._router.put(this.baseUrl + '/tasker', this.registerTasker);
        this._router.post(this.baseUrl + '/tasker/email', this.checkEmailRegisterTasker);
        this._router.post(this.baseUrl + '/tasker/verify-otp', this.checkOtpTasker);
    }

    private registerUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.body;
            const userData = req.body;

            res.send(await this.registerService.registerUser(id, userData));
        } catch (err) {
            next(err);
        }
    };

    private checkEmailRegister = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;

            res.send(await this.registerService.checkEmailRegister(email));
        } catch (err) {
            next(err);
        }
    };

    private checkOtpUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { otp } = req.body;

            res.send(await this.registerService.checkOtpUser(otp));
        } catch (err) {
            next(err);
        }
    };

    private registerTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const taskerData = req.body;
            const { id } = req.body;

            res.send(await this.registerService.registerTasker(id, taskerData));
        } catch (err) {
            next(err);
        }
    };

    private checkEmailRegisterTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;

            res.send(await this.registerService.checkEmailRegisterTasker(email));
        } catch (err) {
            next(err);
        }
    };

    private checkOtpTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { otp } = req.body;

            res.send(await this.registerService.checkOtpTasker(otp));
        } catch (err) {
            next(err);
        }
    };
}
