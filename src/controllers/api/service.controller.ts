import { Response, Request, Router, NextFunction } from 'express';
import { Controller } from '../../common';
import { ServicesService } from '../../services/service.service';
import { auth } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { uploadFile } from '../../middlewares/cloud_upload.middleware';

export class ServiceController implements Controller {
    private readonly baseUrl: string = '/services';
    private _router: Router;
    private readonly serviceService = ServicesService.getInstance();

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    get router() {
        return this._router;
    }

    initRouter() {
        this._router.post(this.baseUrl, auth, authorize(['Admin']), this.createService);
        this._router.get(this.baseUrl + '/:id', auth, this.getServiceById);
        this._router.get(this.baseUrl + '/option/:serviceId/:id', auth, this.getGroupOptionById);
        this._router.get(this.baseUrl, auth, this.getAll);
        this._router.put(this.baseUrl + '/:id', auth, authorize(['Admin']), this.updateService);
        // this._router.put(this.baseUrl + '/option/:id', auth, authorize(['Admin']), this.selected_option);
        this._router.put(
            this.baseUrl + '/upload/:id',
            auth,
            authorize(['Admin']),
            uploadFile.single('img'),
            this.uploadFile
        );
        this._router.delete(this.baseUrl + '/:id', auth, authorize(['Admin']), this.deleteService);
    }

    private createService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const taskData = req.body;
            const { user } = req;

            res.send(await this.serviceService.createService(taskData, user));
        } catch (err) {
            next(err);
        }
    };

    private getServiceById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { user } = req;

            res.send(await this.serviceService.getServiceById(id, user));
        } catch (err) {
            next(err);
        }
    };

    private getGroupOptionById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { serviceId } = req.params;

            res.send(await this.serviceService.getGroupOptionById(serviceId, id));
        } catch (err) {
            next(err);
        }
    };

    private getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query } = req;

            res.send(await this.serviceService.getAllServiceAndPaging(query));
        } catch (err) {
            next(err);
        }
    };

    private updateService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const serviceData = req.body;
            const { user } = req;

            res.send(await this.serviceService.updateService(id, serviceData, user));
        } catch (err) {
            next(err);
        }
    };

    private uploadFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const serviceData = req.file;

            res.send(await this.serviceService.uploadFile(id, serviceData));
        } catch (err) {
            next(err);
        }
    };

    private deleteService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { user } = req;

            res.send(await this.serviceService.deleteService(id, user));
        } catch (err) {
            next(err);
        }
    };
}
