import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { Tasker } from '../models/tasker.model';
import { Service } from '../models/service.model';
import { HttpException } from '../common';
import { FirebaseService } from '../lib/fireBase';
import { IFTasker } from '../interfaces/tasker.interface';
import { IFTask } from '../interfaces/task.interface';
import { uploadManyFiles } from '../middlewares/cloud_upload.middleware';
import { pick } from 'lodash';
import { NotificationService } from '../services/notifications.service';
import {
    TASK_NOT_FOUND,
    TASKER_COMPLETE_TASK,
    TASK_TIME_HAS_NOT_YET_BEEN_REACHED,
    TASKER_GIVE_TASK_REJECTED,
    TASKER_COMPLETE_TASK_PICTURES,
    TASK_HASBEEN_DELETE,
    TASKER_GIVE_TASK,
    UNAUTHORIZED,
    SERVICE_NOT_FOUND,
    DELETE_HAS_A_TASK_USER,
    TASKER_NOT_FOUND,
    USER_NOT_FOUND
} from '../common/constants/err.constants';

export class TaskService {
    private static instance: TaskService;

    static getInstance(): TaskService {
        if (!TaskService.instance) {
            TaskService.instance = new TaskService();
        }

        return TaskService.instance;
    }

    /**
     * Function create task data
     * @param {*} taskData
     * @param {*} user
     * @return
     */
    async createTask(taskData: any, user: any) {
        if (user.type !== 'User') throw new HttpException(401, UNAUTHORIZED);

        const userData = await User.findById(user._id).select({
            _id: 1,
            phoneNumber: 1,
            name: 1,
            email: 1,
            address: 1,
            avatar: 1,
            fcm_token: 1
        });
        if (!userData) throw new HttpException(401, UNAUTHORIZED);

        const services: any = await Service.findById(taskData.service).select({ _id: 1, name: 1, options: 1 });
        if (!services) throw new HttpException(404, SERVICE_NOT_FOUND);

        //Find by id object in array options service and save seleted_option data in task
        const option_service: any = await Service.findOne(
            { _id: services },
            { _id: 0, options: { $elemMatch: { _id: taskData.selected_option } } }
        );

        taskData.posted_user = userData;
        taskData.service = services;
        taskData.selected_option = Object.assign(option_service.options);

        //check time now vs start_time if start_time < time now then error
        if (taskData.start_time < Date.now())
            throw new HttpException(400, { error_code: '400', error_message: 'Is not create task' });

        let task: any = new Task(taskData);

        task.status = 0;
        task.created_time = Date.now();
        task.updated_time = Date.now();

        //Function calulate price option when is selected option in array options
        const price_option = task.selected_option.reduce((total: number, item: any) => {
            return total + item.price;
        }, 0);
        //Total price when create task
        task.total_price = price_option;

        //Find id and update id task to group in user when create task
        const service_task = await User.findById(task.posted_user._id);
        if (!service_task) throw new HttpException(404, { USER_NOT_FOUND });

        service_task.service_used.push(task._id);

        const taskers = await Tasker.find();
        // filter id user and concat group by id tasker in data.
        let listTokens: any = taskers.reduce((acc: any, tasker: any) => acc.concat(tasker._id), []);

        let data: any = {
            title: `Bài đăng tuyển giúp việc nhà.`,
            body: `Bài đăng bởi người dùng ${task.posted_user.name} cần tuyển người giúp việc nhà tại địa chỉ ${task.address.name}.`,
            type_notification: {
                name: 'Notification Task',
                status: 3
            },
            isValidTasker: true,
            taskId: task._id,
            taskerAll: listTokens,
            created_time: Date.now(),
            updated_time: Date.now()
        };

        if (taskers.length > 0) {
            await NotificationService.insertMany(data);
        }

        await service_task.save();
        await task.save();

        this.sendNotificationTasker(taskers, data);

        return task;
    }

    async sendNotificationTasker(taskers: IFTasker[], data: any) {
        //thực hiện lấy fcm_token lưu vào array trong fcm đồng thời lọc các fcm token giống nhau thì chỉ lấy 1 cái.
        let listTokens: string[] = taskers.reduce((acc, tasker) => acc.concat(tasker.fcm_token), []);
        console.log(listTokens);
        listTokens = listTokens.filter((item, pos) => listTokens.indexOf(item) === pos);
        //thực hiện gửi req lên bao gồm data và list token do phía FE gửi lên lưu vào fcm_token database và lấy lưu vào database.
        FirebaseService.sendNotifications(listTokens, data);
    }

    /**
     * Function update task to user
     * @param id
     * @param user
     * @returns
     */
    async updateTaskToUser(id: string, user: any, taskData: any) {
        if (user.type !== 'User') throw new HttpException(401, UNAUTHORIZED);

        const userData = await User.findById(user._id);
        if (!userData) throw new HttpException(401, UNAUTHORIZED);

        const task: any = await Task.findByIdAndUpdate(id, taskData, { new: true });
        if (!task) throw new HttpException(404, TASK_NOT_FOUND);

        //check id tasker in task if is not id tasker in task info error
        if (task.tasker._id)
            throw new HttpException(400, {
                error_code: '400',
                error_message: 'User is not update task because tasker has give a task'
            });

        task.updated_time = Date.now();

        await task.save();
        return task;
    }

    /**
     * Function delete task to user
     * @param user
     * @param taskId
     * @returns
     */
    async rejectedTaskToUser(taskId: string, user: any, taskData: any) {
        if (user.type !== 'User') throw new HttpException(401, { error_code: '401', error_message: 'Unauthorized' });

        const users = await User.findById(user).select({ _id: 1, name: 1 });
        if (!users) throw new HttpException(401, { error_code: '401', error_message: 'Unauthorized' });

        let task: any = await Task.findById(taskId);
        if (!task) throw new HttpException(404, TASK_NOT_FOUND);

        // if (task.tasker._id) throw new HttpException(400, DELETE_HAS_A_TASK_USER);

        // if (task.start_time > Date.now()) throw new HttpException(400, TASK_TIME_HAS_NOT_YET_BEEN_REACHED);
        //data save info user when comment reason rejected
        const failure_reason = {
            reason: taskData.reason,
            user: users
        };

        task.failure_reason = failure_reason;
        task.status = 3;
        task.user_deleted = true;
        task.updated_time = Date.now();

        //Find id user and update id task then calulate success user task
        const fail_user_task = await User.findById(task.posted_user._id);
        if (!fail_user_task) throw new HttpException(404, { USER_NOT_FOUND });
        fail_user_task.fail_task.push(task._id);

        await fail_user_task.save();
        await task.save();

        const data: any = {
            title: `Bài đăng của bạn đã bị hủy.`,
            body: `Bài đăng tuyển giúp việc tại địa chỉ ${task.address.name} của bạn đã được hủy bởi người dùng ${task.posted_user.name}`
        };

        const posted_taskers: any = await Task.find({ _id: task });
        //check id tasker in task if has id tasker send noti to tasker, if has not id tasker save data task.
        if (task.tasker._id) {
            if (posted_taskers.length > 0) {
                await NotificationService.insertMany(
                    posted_taskers.map((task: any) => {
                        return {
                            ...data,
                            tasker: task.tasker._id,
                            taskId: task._id,
                            isValidTasker: true,
                            type_notification: {
                                name: 'Notification Task',
                                status: 4
                            },
                            created_time: Date.now(),
                            updated_time: Date.now()
                        };
                    })
                );
            }
            this.sendNotificationTaskTasker(posted_taskers, data);
        }

        return task;
    }

    /**
     * Function used to create filters
     * help filter data based on user data and user submitted data (search_string)
     *
     * @param {*} service
     * @param {*} status
     * @param {*} tasker
     * @returns
     */
    getFilter(
        user: string,
        tasker: string,
        service: string,
        status: number,
        start_time: number,
        end_time: number,
        date: number
        // orderId: any
    ) {
        let filter: any = {};

        if (user) {
            filter = { 'posted_user._id': user };
        }
        if (tasker) {
            filter = { 'tasker._id': tasker };
        }
        if (service) {
            filter = { 'service._id': service };
        }
        if (status) {
            filter = { status: status };
        }
        if (start_time) {
            filter = { start_time: { $gte: start_time, $lte: start_time } };
        }
        if (end_time) {
            filter = { end_time: { $gte: end_time, $lte: end_time } };
        }
        if (date) {
            filter = { date: { $gte: date, $lte: date } };
        }
        // if (orderId) {
        //     filter = { _id: orderId };
        // }

        return filter;
    }

    /**
     * Function get all task new
     * @param id
     * @returns
     */
    async getAllTaskAndPaging({
        user,
        tasker,
        service,
        status,
        start_time,
        end_time,
        date,
        page,
        limit
    }: // orderId
    {
        user?: string;
        tasker?: string;
        service?: string;
        status?: number;
        start_time?: number;
        end_time?: number;
        date?: number;
        page?: number;
        limit?: number;
        // orderId: any;
    }) {
        let filter = this.getFilter(user, tasker, service, status, start_time, end_time, date);

        if (!page || page <= 0) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }
        let skip = 0;
        skip = (page - 1) * limit;

        const tasks = await Task.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ created_time: 'desc' })
            .select('-posted_user.fcm_token');
        const documentCount = await Task.countDocuments(filter);

        const response = {
            data: tasks,
            meta_data: {
                total_records: documentCount,
                page,
                limit,
                total_page: Math.ceil(documentCount / Number(limit))
            }
        };

        return response;
    }

    /**
     * Function tasker give task when user up task
     * Check task if task not found notification error
     * @param taskId
     * @param tasker
     * @returns
     */
    async giveTaskToTasker(taskId: string, tasker: any) {
        if (tasker.type !== 'Tasker') throw new HttpException(401, UNAUTHORIZED);

        let taskers = await Tasker.findById(tasker);
        if (!taskers) throw new HttpException(401, UNAUTHORIZED);

        //check tasker
        let taskerData = await Tasker.findById(tasker._id).select({
            _id: 1,
            phoneNumber: 1,
            name: 1,
            email: 1,
            address: 1,
            is_deleted: 1,
            avatar: 1,
            fcm_token: 1
        });
        const task: any = await Task.findById(taskId);
        //Check _id or tasker if is not tasker give task then notification error
        if (!taskerData) throw new HttpException(401, UNAUTHORIZED);
        //check id task if not task error
        if (!task) throw new HttpException(404, TASK_NOT_FOUND);
        //check _id tasker in Task if tasker is exist then notification error
        if (task.tasker._id) throw new HttpException(400, TASKER_GIVE_TASK);
        if (task.user_deleted == true) throw new HttpException(400, TASKER_GIVE_TASK_REJECTED);

        task.tasker = taskerData;
        task.status = 1;
        task.updated_time = Date.now();

        //Find id tasker and update id task then calulate total task tasker task
        const give_task_tasker = await Tasker.findById(task.tasker._id);
        if (!give_task_tasker) throw new HttpException(404, TASKER_NOT_FOUND);
        give_task_tasker.total_give_task.push(task._id);

        await give_task_tasker.save();
        await task.save();

        const data: any = {
            title: `Bài đăng của bạn đã được nhận.`,
            body: `Bài đăng tuyển giúp việc tại địa chỉ ${task.address.name} của bạn đã được nhận bởi người giúp việc ${task.tasker.name}`
        };

        const posted_users: any = await Task.find({ _id: task });
        if (posted_users.length > 0) {
            await NotificationService.insertMany(
                posted_users.map((task: any) => {
                    return {
                        ...data,
                        user: task.posted_user._id,
                        taskId: task._id,
                        isValidUser: true,
                        type_notification: {
                            name: 'Notification Task',
                            status: 0
                        },
                        created_time: Date.now(),
                        updated_time: Date.now()
                    };
                })
            );
        }

        this.sendNotificationTaskUser(posted_users, data);

        return task;
    }

    async sendNotificationTaskUser(posted_users: IFTask[], data: any) {
        //thực hiện lấy fcm_token lưu vào array trong fcm đồng thời lọc các fcm token giống nhau thì chỉ lấy 1 cái.
        let listTokens: string[] = posted_users.reduce((acc, task) => acc.concat(task.posted_user.fcm_token), []);
        //kiem tra fcm co trong list fcm khong neu co thì gửi thông báo. (item là phần tử, pop là vị tri phần tử đó)
        listTokens = listTokens.filter((item, pos) => listTokens.indexOf(item) === pos);
        //thực hiện gửi req lên bao gồm data và list token do phía FE gửi lên lưu vào fcm_token database và lấy lưu vào database.
        FirebaseService.sendNotifications(listTokens, data);
    }

    async sendNotificationTaskTasker(posted_taskers: IFTask[], data: any) {
        //thực hiện lấy fcm_token lưu vào array trong fcm đồng thời lọc các fcm token giống nhau thì chỉ lấy 1 cái.
        let listTokens: string[] = posted_taskers.reduce((acc, task) => acc.concat(task.tasker.fcm_token), []);
        //kiem tra fcm co trong list fcm khong neu co thì gửi thông báo. (item là phần tử, pop là vị tri phần tử đó)
        listTokens = listTokens.filter((item, pos) => listTokens.indexOf(item) === pos);
        //thực hiện gửi req lên bao gồm data và list token do phía FE gửi lên lưu vào fcm_token database và lấy lưu vào database.
        FirebaseService.sendNotifications(listTokens, data);
    }

    /**
     * Function delet task to Taske
     * @param taskId
     * @param tasker
     * @param taskerData
     * @returns
     */
    async rejectedTaskToTasker(taskId: string, taskers: any, taskData: any) {
        if (taskers.type !== 'Tasker') throw new HttpException(401, UNAUTHORIZED);

        const taskerData = await Tasker.findById(taskers._id).select({ _id: 1, name: 1 });
        //Check _id or tasker if is not tasker rejected task then notification error
        if (!taskerData) throw new HttpException(404, UNAUTHORIZED);

        let task: any = await Task.findById(taskId);
        //check _id task if not found notification erro
        if (!task) throw new HttpException(404, TASK_NOT_FOUND);

        //Find id tasker and update id task then calulate fail_task task tasker
        const give_task_fail = await Tasker.findById(task.tasker._id);
        if (!give_task_fail) throw new HttpException(404, TASKER_NOT_FOUND);
        give_task_fail.fail_task.push(task._id);

        await give_task_fail.save();

        //data save info tasker when comment reason rejected
        const failure_reason = {
            reason: taskData.reason,
            tasker: taskerData
        };

        task.status = 3;
        task.tasker_deleted = true;
        task.failure_reason = failure_reason;
        task.updated_time = Date.now();

        await task.save();

        const data: any = {
            title: `Bài đăng của bạn đã bị hủy.`,
            body: `Bài đăng tuyển giúp việc tại địa chỉ ${task.address.name} của bạn đã bị hủy bởi người giúp việc tên ${task.tasker.name} vì bận việc gia đình.`
        };

        //Send noti to user when tasker rejected task
        const posted_users = await Task.find({ _id: task });
        if (posted_users.length > 0) {
            await NotificationService.insertMany(
                posted_users.map((task: any) => {
                    return {
                        ...data,
                        user: task.posted_user._id,
                        taskId: task._id,
                        isValidUser: true,
                        type_notification: {
                            name: 'Notification Task',
                            status: 1
                        },
                        created_time: Date.now(),
                        updated_time: Date.now()
                    };
                })
            );
        }

        this.sendNotificationTaskUser(posted_users, data);

        return task;
    }

    /**
     * Function update task when tasker successfully task to user
     * @param {*} taskId
     * @param {*} tasker
     */
    async completeTaskToTasker(taskId: string, tasker: any) {
        if (tasker.type !== 'Tasker') throw new HttpException(401, UNAUTHORIZED);

        const taskerData = await Tasker.findById(tasker._id);
        //Check _id or tasker if is not tasker rejected task then notification error
        if (!taskerData) throw new HttpException(404, UNAUTHORIZED);

        const task: any = await Task.findById(taskId);
        //check _id task if not found notification error
        if (!task) throw new HttpException(404, TASK_NOT_FOUND);

        // check id token vs id tasker in task
        // if (task.tasker._id.toString() !== taskerId._id.toString())
        //     throw new HttpException(400, { error_code: '400', error_message: 'Is not match id tasker in task' });

        // check upload files if tasker is not upload then error
        if (task.list_pictures_after == 0 || task.list_pictures_before == 0)
            throw new HttpException(400, TASKER_COMPLETE_TASK_PICTURES);

        //Find id user and update id task then calulate success user task
        const success_user_task = await Tasker.findById(task.tasker._id);
        if (!success_user_task) throw new HttpException(404, TASKER_NOT_FOUND);
        success_user_task.success_task.push(task._id);

        await success_user_task.save();

        task.status = 2;
        task.updated_time = Date.now();

        await task.save();

        const data: any = {
            title: `Bài đăng của bạn đã được hoàn thành.`,
            body: `Bài đăng tuyển giúp việc tại địa chỉ ${task.address.name} của bạn đã hoàn thành xong bởi người giúp việc tên ${task.tasker.name}.`
        };

        //Send noti to user when rejected task
        const posted_users: any = await Task.find({ _id: task });
        if (posted_users.length > 0) {
            await NotificationService.insertMany(
                posted_users.map((task: any) => {
                    return {
                        ...data,
                        user: task.posted_user._id,
                        taskId: task._id,
                        isValidUser: true,
                        type_notification: {
                            name: 'Notification Task',
                            status: 2
                        },
                        created_time: Date.now(),
                        updated_time: Date.now()
                    };
                })
            );
        }
        this.sendNotificationTaskUser(posted_users, data);

        return task;
    }

    /**
     * Function update task data
     * @param {*} id
     * @param {*} taskData
     * @param {*} user
     * @return
     */
    async updateTask(id: string, taskData: any, user: any) {
        if (user.type !== 'Admin') throw new HttpException(401, UNAUTHORIZED);

        const fields = taskData;

        const task = await Task.findByIdAndUpdate(id, fields, { new: true });
        if (!task) throw new HttpException(400, TASK_NOT_FOUND);

        return task;
    }

    /**
     * Function get by id task data
     * @param id
     * @param user
     * @returns
     */
    async getTaskById(id: string) {
        const task = await Task.findById(id);
        if (!task) throw new HttpException(404, TASK_NOT_FOUND);

        return task;
    }

    /**
     * Function delete task data
     * @param {*} id
     * @param {*} user
     */
    async deleteTask(id: string, user: any) {
        if (user.type !== 'Admin') throw new HttpException(401, UNAUTHORIZED);

        const task = await Task.findByIdAndDelete(id);
        if (!task) throw new HttpException(400, TASK_NOT_FOUND);

        return task;
    }

    /**
     * Function upload files image list
     * @param id
     * @param list_pictures_after
     * @returns
     */
    async uploadFilesAfter(id: string, list_pictures_after: any) {
        let task: any = await Task.findById(id);
        if (!task) throw new HttpException(400, TASK_NOT_FOUND);

        if (!task.tasker._id)
            throw new HttpException(400, {
                error_code: '400',
                error_message: 'Is not upload files because task is not give by tasker'
            });

        //config url link file then send url to cloud google storage data img and save url avatar in database
        let listFile = await uploadManyFiles(list_pictures_after);
        // console.log(task.list_pictures);
        task.list_pictures_after = listFile;
        task.updated_time = Date.now();
        if (!listFile) throw new HttpException(400, { error_code: '400', error_message: '' });

        Object.assign(task, listFile);

        await task.save();
        return task;
    }

    /**
     * Function upload files image list
     * @param id
     * @param list_pictures_after
     * @returns
     */
    async uploadFilesBefore(id: string, list_pictures_after: any) {
        let task: any = await Task.findById(id);
        if (!task) throw new HttpException(400, TASK_NOT_FOUND);

        if (!task.tasker._id)
            throw new HttpException(400, {
                error_code: '400',
                error_message: 'Is not upload files because task is not give by tasker'
            });
        //config url link file then send url to cloud google storage data img and save url avatar in database
        let listFile = await uploadManyFiles(list_pictures_after);
        // console.log(task.list_pictures);
        task.list_pictures_before = listFile;
        task.updated_time = Date.now();
        if (!listFile) throw new HttpException(400, { error_code: '400', error_message: '' });

        Object.assign(task, listFile);

        await task.save();
        return task;
    }
}
