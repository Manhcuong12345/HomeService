import { NextFunction, Request, Response, Router } from 'express';
import { CategoryService } from '../../services/category.service';
import { Controller } from '../../common';
import { auth } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

export class CategoryController implements Controller {
    private readonly baseUrl: string = '/categories';
    private _router: Router;
    private readonly categoryService = CategoryService.getInstance();

    get router(): Router {
        return this._router;
    }

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    private initRouter(): void {
        this._router.post(this.baseUrl, auth, authorize(['Admin']), this.create);
        this._router.get(this.baseUrl, auth, authorize(['Admin']), this.getAll);
    }

    private create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { body } = req;

            res.send(await this.categoryService.create(body));
        } catch (err) {
            next(err);
        }
    };

    private getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.send(await this.categoryService.getAll());
        } catch (err) {
            next(err);
        }
    };
}
