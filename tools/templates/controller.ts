import { Request, Response, Router } from 'express';
import { Controller } from '../../common';

export class AppController implements Controller {
    private readonly baseUrl: string = '/';
    private _router: Router;

    get router(): Router {
        return this._router;
    }

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    private initRouter(): void {}
}
