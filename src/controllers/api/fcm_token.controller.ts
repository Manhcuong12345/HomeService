import { NextFunction, Request, Response, Router } from 'express';
import { FcmtokenService } from '../../services/fcm_token.service';
import { Controller } from '../../common';
import { auth } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

export class FcmTokenController implements Controller {
    private readonly baseUrl: string = '/fcm-token';
    private _router: Router;
    private readonly fcmtokenService = FcmtokenService.getInstance();

    get router(): Router {
        return this._router;
    }

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    private initRouter(): void {
        this._router.put(this.baseUrl + '/user', auth, auth, authorize(['User']), this.createFcmTokenUser);
        this._router.delete(this.baseUrl + '/user', auth, authorize(['User']), this.removeFcmTokenUser);
        this._router.put(this.baseUrl + '/tasker', auth, authorize(['Tasker']), this.createFcmTokenTasker);
        this._router.delete(this.baseUrl + '/tasker', auth, authorize(['Tasker']), this.removeFcmTokenTasker);
    }

    private createFcmTokenUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const { fcm_token } = req.body;

            res.send(await this.fcmtokenService.createFcmTokenUser(user._id, fcm_token));
        } catch (err) {
            next(err);
        }
    };

    private removeFcmTokenUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const { fcm_token } = req.body;
            res.send(await this.fcmtokenService.removeFcmTokenUser(user._id, fcm_token));
        } catch (err) {
            next(err);
        }
    };

    private createFcmTokenTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const { fcm_token } = req.body;

            res.send(await this.fcmtokenService.createFcmTokenTasker(user._id, fcm_token));
        } catch (err) {
            next(err);
        }
    };

    private removeFcmTokenTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const { fcm_token } = req.body;
            res.send(await this.fcmtokenService.removeFcmTokenTasker(user._id, fcm_token));
        } catch (err) {
            next(err);
        }
    };
}
