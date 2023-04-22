import { NextFunction, Request, Response, Router } from 'express';
import { PushNotificationService } from '../../services/push_notification.service';
import { Controller } from '../../common';
import { auth } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

export class PushNotificationController implements Controller {
    private readonly baseUrl: string = '/push-notifications';
    private _router: Router;
    private readonly notificationService = PushNotificationService.getInstance();

    get router(): Router {
        return this._router;
    }

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    private initRouter(): void {
        this._router.get(this.baseUrl, auth, authorize(['Admin']), this.getAll);
        this._router.post(this.baseUrl, auth, authorize(['Admin']), this.create);
        this._router.post(this.baseUrl + '/tasker/:id', auth, authorize(['Admin']), this.pushNotificationAllTasker);
        this._router.post(this.baseUrl + '/user/:id', auth, authorize(['Admin']), this.pushNotificationAllUser);
        this._router.get(this.baseUrl + '/:id', auth, authorize(['Admin']), this.getById);
        this._router.put(this.baseUrl + '/:id', auth, authorize(['Admin']), this.updateNotification);
        this._router.delete(this.baseUrl + '/:id', auth, authorize(['Admin']), this.deleteNotification);
    }

    private getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query } = req;
            res.send(await this.notificationService.findAllAndPagning(query));
        } catch (err) {
            next(err);
        }
    };

    private create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notificationData = req.body;
            res.send(await this.notificationService.create(notificationData));
        } catch (err) {
            next(err);
        }
    };

    private getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            res.send(await this.notificationService.getNotiById(id));
        } catch (err) {
            next(err);
        }
    };

    private updateNotification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notificationData = req.body;
            const { id } = req.params;

            res.send(await this.notificationService.updateNotification(id, notificationData));
        } catch (err) {
            next(err);
        }
    };

    private deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            res.send(await this.notificationService.deleteNotification(id));
        } catch (err) {
            next(err);
        }
    };

    private pushNotificationAllTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const notificationData = req.body;
            const { id } = req.params;

            res.send(await this.notificationService.pushNotificationAllTasker(id));
        } catch (err) {
            next(err);
        }
    };

    private pushNotificationAllUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            res.send(await this.notificationService.pushNotificationAllUser(id));
        } catch (err) {
            next(err);
        }
    };
}
