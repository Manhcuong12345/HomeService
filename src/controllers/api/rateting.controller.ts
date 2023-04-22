import { NextFunction, Request, Response, Router } from 'express';
import { RatetingService } from '../../services/rateting.service';
import { Controller } from '../../common';
import { auth } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

export class RatetingController implements Controller {
    private readonly baseUrl: string = '/rates';
    private _router: Router;
    private readonly ratetingService = RatetingService.getInstance();

    get router(): Router {
        return this._router;
    }

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    private initRouter(): void {
        this._router.put(this.baseUrl + '/task/:id', auth, authorize(['User']), this.createRattingComments);
        // this._router.get(this.baseUrl, auth, this.getAll);
        // this._router.put(this.baseUrl + '/:id', auth, authorize(['User']), this.updateComment);
        // this._router.delete(this.baseUrl + '/:id', auth, authorize(['User']), this.deleteComment);
    }

    private createRattingComments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const { user } = req;
            const { id } = req.params;

            res.send(await this.ratetingService.createRattingComments(id, user, data));
        } catch (err) {
            next(err);
        }
    };

    // private updateComment = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const contactData = req.body;
    //         const { id } = req.params;

    //         res.send(await this.ratetingService.updateComment(id, contactData));
    //     } catch (err) {
    //         next(err);
    //     }
    // };

    // private getAll = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const { query } = req;
    //         res.send(await this.ratetingService.getAll(query));
    //     } catch (err) {
    //         next(err);
    //     }
    // };

    // private deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const { id } = req.params;
    //         res.send(await this.ratetingService.deleteComment(id));
    //     } catch (err) {
    //         next(err);
    //     }
    // };
}
