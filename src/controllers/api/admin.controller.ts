import { Response, Request, Router, NextFunction } from 'express';
import { Controller } from '../../common';
import { AdminService } from '../../services/admin.service';
import { auth } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { uploadFile } from '../../middlewares/cloud_upload.middleware';

export class AdminController implements Controller {
    private readonly baseUrl: string = '/admins';
    private _router: Router;
    private readonly adminService = AdminService.getInstance();

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    get router() {
        return this._router;
    }

    initRouter() {
        this._router.post(this.baseUrl, auth, authorize(['Admin']), this.createAdmin);
        this._router.put(
            this.baseUrl + '/upload',
            auth,
            authorize(['Admin']),
            uploadFile.single('avatar'),
            this.uploadFile
        );
        this._router.get(this.baseUrl + '/me', auth, authorize(['Admin']), this.getMe);
        this._router.get(this.baseUrl, auth, authorize(['Admin']), this.getAll);
        this._router.put(this.baseUrl + '/me/change-password', auth, authorize(['Admin']), this.changePassword);
        this._router.put(this.baseUrl + '/me', auth, authorize(['Admin']), this.updateMe);
        this._router.get(this.baseUrl + '/:id', auth, authorize(['Admin']), this.getAdminById);
        this._router.put(this.baseUrl + '/:id', auth, authorize(['Admin']), this.updateAdmin);
        this._router.delete(this.baseUrl + '/:id', auth, authorize(['Admin']), this.deleteAdmin);
    }

    private getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;

            res.send(await this.adminService.getMe(user));
        } catch (err) {
            next(err);
        }
    };

    private getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user, query } = req;

            res.send(await this.adminService.getAllAdminAndPaging(query, user));
        } catch (err) {
            next(err);
        }
    };

    private uploadFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const adminData = req.file;
            res.send(await this.adminService.uploadFile(user._id, adminData));
        } catch (err) {
            next(err);
        }
    };

    private updateMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const adminData = req.body;

            res.send(await this.adminService.updateAdmin(user, adminData));
        } catch (err) {
            next(err);
        }
    };

    private createAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = req.body;

            res.send(await this.adminService.createAdmin(userData));
        } catch (err) {
            next(err);
        }
    };

    private getAdminById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            res.send(await this.adminService.getAdminById(id));
        } catch (err) {
            next(err);
        }
    };

    private updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const adminData = req.body;

            res.send(await this.adminService.updateAdmin(id, adminData));
        } catch (err) {
            next(err);
        }
    };

    private changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { password, new_password } = req.body;

            const { user } = req;

            res.send(await this.adminService.changePassword(user._id, password, new_password));
        } catch (err) {
            next(err);
        }
    };

    private deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            res.send(await this.adminService.deleteAdmin(id));
        } catch (err) {
            next(err);
        }
    };
}
