import { Response, Request, Router, NextFunction, query } from 'express';
import { Controller } from '../../common';
import { TaskService } from '../../services/task.service';
import { auth } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { uploadFile } from '../../middlewares/cloud_upload.middleware';

export class TaskController implements Controller {
    private readonly baseUrl: string = '/tasks';
    private _router: Router;
    private readonly taskService = TaskService.getInstance();

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    get router() {
        return this._router;
    }

    initRouter() {
        this._router.get(this.baseUrl, auth, this.getAll);
        this._router.get(this.baseUrl + '/:id', auth, this.getTaskById);
        this._router.post(this.baseUrl, auth, authorize(['User']), this.createTask);
        this._router.post(this.baseUrl + '/tasker/:taskId', auth, authorize(['Tasker']), this.giveTaskToTasker);
        this._router.put(
            this.baseUrl + '/tasker/complete/:taskId',
            auth,
            authorize(['Tasker']),
            this.completeTaskToTasker
        );
        this._router.put(
            this.baseUrl + '/upload-after/:id',
            auth,
            authorize(['Tasker']),
            uploadFile.array('list_pictures_after'),
            this.uploadFilesAfter
        );
        this._router.put(
            this.baseUrl + '/upload-before/:id',
            auth,
            authorize(['Tasker']),
            uploadFile.array('list_pictures_before'),
            this.uploadFilesBefore
        );
        this._router.put(this.baseUrl + '/:id', auth, authorize(['Admin']), this.updateTask);
        this._router.put(this.baseUrl + '/user/:id', auth, this.updateTaskToUser);
        this._router.delete(this.baseUrl + '/:id', auth, authorize(['Admin']), this.deleteTask);
        this._router.delete(this.baseUrl + '/tasker/:taskId', auth, authorize(['Tasker']), this.rejectedTaskToTasker);
        this._router.delete(this.baseUrl + '/user/:taskId', auth, this.rejectedTaskToUser);
    }

    private getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query } = req;

            res.send(await this.taskService.getAllTaskAndPaging(query));
        } catch (err) {
            next(err);
        }
    };

    private getTaskById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            res.send(await this.taskService.getTaskById(id));
        } catch (err) {
            next(err);
        }
    };

    private createTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const taskData = req.body;
            const { user } = req;

            res.send(await this.taskService.createTask(taskData, user));
        } catch (err) {
            next(err);
        }
    };

    private giveTaskToTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { taskId } = req.params;
            const { user } = req;

            res.send(await this.taskService.giveTaskToTasker(taskId, user));
        } catch (err) {
            next(err);
        }
    };

    private updateTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const taskData = req.body;
            const { user } = req;

            res.send(await this.taskService.updateTask(id, taskData, user));
        } catch (err) {
            next(err);
        }
    };

    private updateTaskToUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const taskData = req.body;
            const { user } = req;

            res.send(await this.taskService.updateTaskToUser(id, user, taskData));
        } catch (err) {
            next(err);
        }
    };

    private deleteTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { user } = req;

            res.send(await this.taskService.deleteTask(id, user));
        } catch (err) {
            next(err);
        }
    };

    private rejectedTaskToTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const { taskId } = req.params;
            const taskData = req.body;

            res.send(await this.taskService.rejectedTaskToTasker(taskId, user, taskData));
        } catch (err) {
            next(err);
        }
    };

    private rejectedTaskToUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = req;
            const { taskId } = req.params;
            const taskData = req.body;

            res.send(await this.taskService.rejectedTaskToUser(taskId, user, taskData));
        } catch (err) {
            next(err);
        }
    };

    private completeTaskToTasker = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { taskId } = req.params;
            const { user } = req;

            res.send(await this.taskService.completeTaskToTasker(taskId, user));
        } catch (err) {
            next(err);
        }
    };

    private uploadFilesAfter = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const list_pictures_after = req.files;
            const { id } = req.params;

            res.send(await this.taskService.uploadFilesAfter(id, list_pictures_after));
        } catch (err) {
            next(err);
        }
    };

    private uploadFilesBefore = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const list_pictures_before = req.files;
            const { id } = req.params;

            res.send(await this.taskService.uploadFilesBefore(id, list_pictures_before));
        } catch (err) {
            next(err);
        }
    };
}
