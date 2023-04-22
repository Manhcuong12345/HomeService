import { Notification } from '../models/notification.model';
import { HttpException } from '../common';
import { NOTIFICATION_NOT_FOUND } from '../common/constants/err.constants';
import { User } from '../models/user.model';
import { Tasker } from '../models/tasker.model';
import { FirebaseService } from '../lib/fireBase';
import { filterAllNoti } from '../lib/helper';

export class NotificationService {
    private static instance: NotificationService;

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    /**
     * Function create noti data
     * @param {*} notificationData
     * @return
     */
    async create(notificationData: any) {
        const notifications: any = new Notification(notificationData);
        await notifications.save();

        return notifications;
    }

    static async insertMany(notificationData: any[]) {
        await Notification.create(notificationData);
    }

    /**
     * Function used to create filters
     * help filter data based on user data and user submitted data (search_string)
     * @param {*} userId
     * @returns
     */
    getFilterUser(userId: string) {
        let filter: any = {}; //userId is a id in filed user in model schema Notification, user is a name field

        //filter userId in token and token to in group userAll if token id user == id userAll then filter data
        if (userId) {
            filter.$or = [{ userAll: { $in: [userId] } }, { user: userId }];
        }

        return filter;
    }

    /**
     * Function used to create filters
     * help filter data based on user data and user submitted data (search_string)
     * @param {*} taskerId
     * @returns
     */
    getFilterTasker(taskerId: string) {
        let filter: any = {}; //userId is a id in filed user in model schema Notification, user is a name fields

        if (taskerId) {
            filter.$or = [{ taskerAll: { $in: [taskerId] } }, { tasker: taskerId }];
        }

        return filter;
    }

    /**
     * Function get all noti user and pagning
     * @param {*}
     */
    async findAllAndPagningUser({ page, limit }: { page?: number; limit?: number }, userId: string) {
        if (!page || page <= 0) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }

        let skip = 0;
        skip = (page - 1) * limit;

        const filter = this.getFilterUser(userId);

        const notifications: any = await Notification.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ created_time: 'desc' });
        const documentCount = await Notification.countDocuments(filter);

        const response = {
            data: notifications,
            meta_data: {
                total_records: documentCount,
                limit: limit,
                page: page,
                total_page: Math.ceil(documentCount / Number(limit))
            }
        };

        return response;
    }

    /**
     * Function get all noti tasker and pagning
     * @param {*}
     */
    async findAllAndPagningTasker({ page, limit }: { page?: number; limit?: number }, taskerId: string) {
        if (!page || page <= 0) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }
        let skip = 0;
        skip = (page - 1) * limit;

        const filter = this.getFilterTasker(taskerId);

        const notifications = await Notification.find(filter).skip(skip).limit(limit).sort({ created_time: 'desc' });
        const documentCount = await Notification.countDocuments(filter);

        const response = {
            data: notifications,
            meta_data: {
                total_records: documentCount,
                limit: limit,
                page: page,
                total_page: Math.ceil(documentCount / Number(limit))
            }
        };

        return response;
    }

    /**
     * Function read all noti when user read noti.
     *@param {*} user
     */
    async readAllNotificationUser(user: any) {
        const filter = { $or: [{ user: user._id }, { userAll: { $in: [user._id] } }] };

        this.syncUINotification(user._id, { notiId: 'all' });
        console.log(this.syncUINotification(user._id, { notiId: 'all' }));

        return this.updateMany(filter, { read: true });
    }

    /**
     * Function read all noti when tasker read noti.
     *@param {*} tasker
     */
    async readAllNotificationTasker(tasker: any) {
        const filter = { $or: [{ tasker: tasker._id }, { taskerAll: { $in: [tasker._id] } }] };

        this.syncUINotificationTasker(tasker._id, { notiId: 'all' });
        console.log(this.syncUINotification(tasker._id, { notiId: 'all' }));

        return this.updateMany(filter, { read: true });
    }

    /**
     * Function updateMany has using to readAllNotification
     * @param {*} filter
     * @param {*} notification
     * @returns
     */
    async updateMany(filter: any, notification: any) {
        const result = await Notification.updateMany(filter, notification, { upsert: true });
        if (!result) throw new HttpException(404, NOTIFICATION_NOT_FOUND);

        return result;
    }

    /**
     * Function update noti when read one noti to user
     * @param {*} id
     * @param {*} user
     */
    async updateReadNotificationUser(id: string, user: any) {
        const filter = { _id: id, user: user._id };
        this.syncUINotification(user._id, { notiId: id });

        return this.updateOneUser(filter, { read: true });
    }

    /**
     * Function update noti when read one noti to user
     * @param {*} id
     * @param {*} tasker
     */
    async updateReadNotificationTasker(id: string, tasker: any) {
        const filter = { _id: id, tasker: tasker._id };
        this.syncUINotificationTasker(tasker._id, { notiId: id });

        return this.updateOneTasker(filter, { read: true });
    }

    /**
     * Function updateOne has using to function updateReadNotification
     * @param {*} filter
     * @param {*} notificationData
     * @returns
     */
    async updateOneUser(filter: any, notificationData: any) {
        const notification = await Notification.findByIdAndUpdate(filter, notificationData, { new: true });
        if (notification.isValidUser !== true) throw new HttpException(404, NOTIFICATION_NOT_FOUND);
        if (!notification) throw new HttpException(404, NOTIFICATION_NOT_FOUND);

        return notification;
    }

    /**
     * Function updateOne has using to function updateReadNotification
     * @param {*} filter
     * @param {*} notificationData
     * @returns
     */
    async updateOneTasker(filter: any, notificationData: any) {
        const notification: any = await Notification.findByIdAndUpdate(filter, notificationData, { new: true });
        if (notification.isValidTasker !== true) throw new HttpException(404, NOTIFICATION_NOT_FOUND);
        if (!notification) throw new HttpException(404, NOTIFICATION_NOT_FOUND);

        return notification;
    }

    /**
     * Function used to create filters
     * help filter data all noti to user
     * @param {*} userId
     * @returns
     */
    getFilterUserNotiAll(userId: any) {
        let filter: any = {};

        //filter noti all and noti user check id user == id userAll group then get data.
        if (userId) {
            filter.$or = [
                { read: { $ne: true }, userAll: { $in: [userId] } },
                { read: { $ne: true }, user: userId }
            ];
        }

        return filter;
    }

    /**
     * Function used to create filters
     * help filter data all noti to user
     * @param {*} taskerId
     * @returns
     */
    getFilterTaskerNotiAll(taskerId: any) {
        let filter: any = {};

        //filter noti all and noti user check id user == id userAll group then get data.
        if (taskerId) {
            filter.$or = [
                { read: { $ne: true }, taskerAll: { $in: [taskerId] } },
                { read: { $ne: true }, tasker: taskerId }
            ];
        }

        return filter;
    }

    /**
     * Function count total unread noti has read to user
     * @param {*} userId
     * @returns
     */
    async totalUnreadNotificationUser(userId?: any) {
        const filter = this.getFilterUserNotiAll(userId);
        const totalUnreadNoti = await Notification.countDocuments(filter);

        return { totalUnreadNoti };
    }

    /**
     * Function count total unread noti has read to tasker
     * @param {*} taskerId
     * @returns
     */
    async totalUnreadNotificationTasker(taskerId?: any) {
        const filter = this.getFilterTaskerNotiAll(taskerId);
        const totalUnreadNoti = await Notification.countDocuments(filter);

        return { totalUnreadNoti };
    }

    /**
     * Function to send notifications to reload UI notifications
     * If a notifications was read, a firebase message will be sent to sync the UI of all devices and websites logged in with this account
     * @param userId
     */
    async syncUINotification(userId: string, option?: any) {
        const user = await User.findOne({ _id: userId });
        if (user) {
            FirebaseService.sendBackgroundNotifications(user.fcm_token, {
                reloadNotifications: true,
                ...option
            });
        }
    }

    /**
     * Function to send notifications to reload UI notifications
     * If a notifications was read, a firebase message will be sent to sync the UI of all devices and websites logged in with this account
     * @param taskerId
     */
    async syncUINotificationTasker(taskerId: string, option?: any) {
        const tasker = await Tasker.findOne({ _id: taskerId });
        if (tasker) {
            FirebaseService.sendBackgroundNotifications(tasker.fcm_token, {
                reloadNotifications: true,
                ...option
            });
        }
    }
}
