import { NextFunction, Request, Response, Router } from 'express';
import { NotificationService } from '../../services/notifications.service';
import { Controller } from '../../common';
import { auth } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

export class NotificationController implements Controller {
    private readonly baseUrl: string = '/notifications';
    private _router: Router;
    private readonly notificationService = NotificationService.getInstance();

    get router(): Router {
        return this._router;
    }

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    private initRouter(): void {
        this._router.get(this.baseUrl + '/user', auth, authorize(['User']), this.getAllNotiUser);
        this._router.get(this.baseUrl + '/tasker', auth, authorize(['Tasker']), this.getAllNotiTasker);
        this._router.get(
            this.baseUrl + '/user/unread/total',
            auth,
            authorize(['User']),
            this.totalUnreadNotificationUser
        );
        this._router.put(this.baseUrl + '/user/read/all', auth, authorize(['User']), this.readAllNotificationUser);
        this._router.put(this.baseUrl + '/user/read/:id', auth, authorize(['User']), this.updateReadNotificationUser);
        this._router.get(
            this.baseUrl + '/tasker/unread/total',
            auth,
            authorize(['Tasker']),
            this.totalUnreadNotificationTasker
        );
        this._router.put(
            this.baseUrl + '/tasker/read/all',
            auth,
            authorize(['Tasker']),
            this.readAllNotificationTasker
        );
        this._router.put(
            this.baseUrl + '/tasker/read/:id',
            auth,
            authorize(['Tasker']),
            this.updateReadNotificationTasker
        );
    }

    private getAllNotiUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query } = req;
            const { user } = req;

            res.send(await this.notificationService.findAllAndPagningUser(query, user._id));
        } catch (err) {
            next(err);
        }
    };

    private getAllNotiTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query } = req;
            const { user } = req;

            res.send(await this.notificationService.findAllAndPagningTasker(query, user._id));
        } catch (err) {
            next(err);
        }
    };

    private totalUnreadNotificationUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;

            res.send(await this.notificationService.totalUnreadNotificationUser(user._id));
        } catch (err) {
            next(err);
        }
    };

    private readAllNotificationUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;

            res.send(await this.notificationService.readAllNotificationUser(user));
        } catch (err) {
            next(err);
        }
    };

    private updateReadNotificationUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { user } = req;

            res.send(await this.notificationService.updateReadNotificationUser(id, user));
        } catch (err) {
            next(err);
        }
    };

    private totalUnreadNotificationTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;

            res.send(await this.notificationService.totalUnreadNotificationTasker(user._id));
        } catch (err) {
            next(err);
        }
    };

    private readAllNotificationTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;

            res.send(await this.notificationService.readAllNotificationTasker(user));
        } catch (err) {
            next(err);
        }
    };

    private updateReadNotificationTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { user } = req;

            res.send(await this.notificationService.updateReadNotificationTasker(id, user));
        } catch (err) {
            next(err);
        }
    };
}
