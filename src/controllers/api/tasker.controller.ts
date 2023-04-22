import { Response, Request, Router, NextFunction } from 'express';
import { auth } from '../../middlewares/auth.middleware';
import { Controller } from '../../common';
import { TaskerService } from '../../services/tasker.service';
import { authorize } from '../../middlewares/authorize.middleware';
import { uploadFile } from '../../middlewares/cloud_upload.middleware';

export class TaskerController implements Controller {
    private readonly baseUrl: string = '/taskers';
    private _router: Router;
    private readonly taskerService = TaskerService.getInstance();

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    get router() {
        return this._router;
    }

    initRouter() {
        this._router.post(this.baseUrl, auth, authorize(['Admin']), this.createTasker);
        this._router.put(
            this.baseUrl + '/upload',
            auth,
            authorize(['Tasker']),
            uploadFile.single('avatar'),
            this.uploadFile
        );
        this._router.put(
            this.baseUrl + '/upload/household',
            auth,
            authorize(['Tasker']),
            uploadFile.array('list_pictures_household'),
            this.uploadFilesHousehold
        );
        this._router.put(
            this.baseUrl + '/upload/crimerecords',
            auth,
            authorize(['Tasker']),
            uploadFile.array('list_pictures_crimerecords'),
            this.uploadFilesCrimeRecored
        );
        this._router.put(
            this.baseUrl + '/upload/:id',
            auth,
            authorize(['Admin']),
            uploadFile.array('avatar'),
            this.uploadFileAdmin
        );
        this._router.get(this.baseUrl + '/me', auth, authorize(['Tasker']), this.getMe);
        // this._router.get(this.baseUrl + '/vnpay_return', this.getReturnPayment);
        this._router.get(this.baseUrl, auth, authorize(['Admin']), this.getAll);
        this._router.get(this.baseUrl + '/:id', auth, this.getTaskerById);
        this._router.put(this.baseUrl + '/me', auth, authorize(['Tasker']), this.updateMe);
        this._router.put(this.baseUrl + '/me/change-password', auth, authorize(['Tasker']), this.changePassword);
        this._router.put(
            this.baseUrl + '/delete-file/household',
            auth,
            authorize(['Tasker']),
            this.deleteFileHouseHold
        );
        this._router.put(
            this.baseUrl + '/delete-file/crimerecords',
            auth,
            authorize(['Tasker']),
            this.deleteFileCrimeRecords
        );
        this._router.put(this.baseUrl + '/:id', auth, authorize(['Admin']), this.updateTasker);
        this._router.delete(this.baseUrl + '/:id', auth, authorize(['Admin']), this.deleteTasker);
    }

    private createTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const taskerData = req.body;
            // const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

            res.send(await this.taskerService.createTasker(user, taskerData));
        } catch (err) {
            next(err);
        }
    };

    private uploadFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const taskerData = req.file;

            res.send(await this.taskerService.uploadFile(user._id, taskerData));
        } catch (err) {
            next(err);
        }
    };

    private uploadFileAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const taskerData = req.file;

            res.send(await this.taskerService.uploadFile(id, taskerData));
        } catch (err) {
            next(err);
        }
    };

    private getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;

            res.send(await this.taskerService.getMe(user));
        } catch (err) {
            next(err);
        }
    };

    private getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user, query } = req;

            res.send(await this.taskerService.getAllTaskersAndPaging(query, user));
        } catch (err) {
            next(err);
        }
    };

    // private getReturnPayment = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const vnp_Params = req.query;

    //         res.send(await this.taskerService.getReturnPayment(vnp_Params));
    //     } catch (err) {
    //         next(err);
    //     }
    // };

    private getTaskerById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { user } = req;

            res.send(await this.taskerService.getTaskerById(id, user));
        } catch (err) {
            next(err);
        }
    };

    private updateMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const taskerData = req.body;

            res.send(await this.taskerService.updateTasker(user._id, taskerData, user));
        } catch (err) {
            next(err);
        }
    };

    private changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const { password, new_password } = req.body;

            res.send(await this.taskerService.changePassword(user._id, password, new_password));
        } catch (err) {
            next(err);
        }
    };

    private updateTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const taskerDataUpdate = req.body;
            const { user } = req;

            res.send(await this.taskerService.updateTasker(id, taskerDataUpdate, user));
        } catch (err) {
            next(err);
        }
    };

    private deleteTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            res.send(await this.taskerService.deleteTasker(id));
        } catch (err) {
            next(err);
        }
    };

    private uploadFilesHousehold = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const list_files_household = req.files;
            const { user } = req;

            res.send(await this.taskerService.uploadFilesHousehold(user._id, list_files_household));
        } catch (err) {
            next(err);
        }
    };

    private deleteFileHouseHold = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const { list_pictures_household } = req.body;

            res.send(await this.taskerService.deleteFileHouseHold(user._id, list_pictures_household));
        } catch (err) {
            next(err);
        }
    };

    private deleteFileCrimeRecords = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const { list_pictures_crimerecords } = req.body;

            res.send(await this.taskerService.deleteFileCrimeRecords(user._id, list_pictures_crimerecords));
        } catch (err) {
            next(err);
        }
    };

    private uploadFilesCrimeRecored = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const list_files_crime = req.files;
            const { user } = req;

            res.send(await this.taskerService.uploadFilesCrimeRecored(user._id, list_files_crime));
        } catch (err) {
            next(err);
        }
    };
}
