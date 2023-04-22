import { Response, Request, Router, NextFunction } from 'express';
import { Controller } from '../../common';
import { AuthService } from '../../services/auth.service';

export class AuthController implements Controller {
    private readonly baseUrl: string = '/login';
    private _router: Router;
    private readonly authService = AuthService.getInstance();

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    get router() {
        return this._router;
    }

    initRouter() {
        this._router.post(this.baseUrl + '/user', this.login);
        this.router.post(this.baseUrl + '/tasker', this.loginTasker);
        this._router.post(this.baseUrl + '/admin', this.loginAdmin);
        this._router.post(this.baseUrl + '/facebook', this.facebookLogin);
        this._router.post(this.baseUrl + '/google', this.googleLoginUser);
    }

    private login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            return await this.authService.login(email, password, res);
        } catch (err) {
            next(err);
        }
    };

    private loginTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            return await this.authService.loginTasker(email, password, res);
        } catch (err) {
            next(err);
        }
    };

    private loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            return await this.authService.loginAdmin(email, password, res);
        } catch (err) {
            next(err);
        }
    };

    private facebookLogin = (req: Request, res: Response, next: NextFunction) => {
        try {
            const { accessToken } = req.body;

            return this.authService.getUserByFBToken(accessToken, res);
        } catch (err) {
            next(err);
        }
    };

    private googleLoginUser = (req: Request, res: Response, next: NextFunction) => {
        try {
            const { accessToken } = req.body;

            return this.authService.getUserByGGToken(accessToken, res);
        } catch (err) {
            next(err);
        }
    };
}
