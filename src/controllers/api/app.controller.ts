// import { Request, Response, Router } from 'express';
// import { AppService } from '../../services/app.service';
// import { Controller } from '../../common';

// export class AppController implements Controller {
//     private readonly baseUrl: string = '/';
//     private _router: Router;
//     private readonly appService = AppService.getInstance();

//     get router(): Router {
//         return this._router;
//     }

//     constructor() {
//         this._router = Router();
//         this.initRouter();
//     }

//     private initRouter(): void {
//         this._router.get(this.baseUrl, this.helloWorld);
//     }

//     private helloWorld = (req: Request, res: Response) => {
//         const data = this.appService.helloWorld();
//         res.send(data);
//     };
// }
