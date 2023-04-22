import { Pushnotification } from '../models/push_notification.model';
import { HttpException } from '../common';
import { NOTIFICATION_NOT_FOUND } from '../common/constants/err.constants';
import { User } from '../models/user.model';
import { Tasker } from '../models/tasker.model';
import { FirebaseService } from '../lib/fireBase';
import { IFUser } from '../interfaces/user.interface';
import { NotificationService } from '../services/notifications.service';
import { IFTasker } from '../interfaces/tasker.interface';

export class PushNotificationService {
    private static instance: PushNotificationService;

    static getInstance(): PushNotificationService {
        if (!PushNotificationService.instance) {
            PushNotificationService.instance = new PushNotificationService();
        }
        return PushNotificationService.instance;
    }

    /**
     * Function create noti data
     * @param {*} notificationData
     * @return
     */
    async create(notificationData: any) {
        const push_notification = new Pushnotification(notificationData);
        await push_notification.save();

        return push_notification;
    }

    static async insertMany(notificationData: any[]) {
        await Pushnotification.create(notificationData);
    }

    /**
     * Function used to create filters
     * help filter data based on user data and user submitted data (search_string)
     * @param {*} search_string
     * @returns
     */
    getFilter(search_string: string, type: string) {
        let filter: any = {}; //userId is a id in filed user in model schema Notification, user is a name fields

        if (search_string) {
            filter = { title: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } };
        }
        if (type) {
            filter = { target_type: { $regex: new RegExp(['', type, ''].join(''), 'i') } };
        }
        return filter;
    }

    /**
     * Function get all noti and pagning
     * @param {*}
     */
    async findAllAndPagning({
        search_string,
        type,
        page,
        limit
    }: {
        search_string?: string;
        type?: string;
        page?: number;
        limit?: number;
    }) {
        if (!page || page <= 0) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }
        let skip = 0;
        skip = (page - 1) * limit;

        const filter = this.getFilter(search_string, type);
        const notifications = await Pushnotification.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ created_time: 'desc' })
            .select('-user')
            .select('-tasker');
        const documentCount = await Pushnotification.countDocuments(filter);

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
     * Function get noti by id
     * @param {*} id
     */
    async getNotiById(id: string) {
        const noti = await Pushnotification.findById(id);
        if (!noti) throw new HttpException(404, NOTIFICATION_NOT_FOUND);

        return noti;
    }

    /**
     * Function update data notification
     *@param {*} notificationData
     *@param {*} id
     */
    async updateNotification(id: string, notificationData: any) {
        let notification = await Pushnotification.findByIdAndUpdate(id, notificationData, { new: true });
        if (!notification) throw new HttpException(404, NOTIFICATION_NOT_FOUND);

        return notification;
    }

    /**
     * Function delete data notification
     *@param {*} id
     */
    async deleteNotification(id: string) {
        const notification = await Pushnotification.findByIdAndDelete(id);
        if (!notification) throw new HttpException(404, NOTIFICATION_NOT_FOUND);

        return notification;
    }

    /**
     * Function send push noti to all tasker
     *@param {*} notificationData
     *@param {*} id
     */
    async pushNotificationAllTasker(id: any) {
        let notification = await Pushnotification.findById(id);
        if (!notification) throw new HttpException(404, NOTIFICATION_NOT_FOUND);

        const taskers = await Tasker.find();
        let listTokens: any = taskers.reduce((acc: any, tasker: any) => acc.concat(tasker._id), []);

        let data: any = {
            title: notification.title,
            body: notification.description,
            type_notification: {
                name: 'Notification vouncher all Tasker'
            },
            isValidTasker: true,
            taskerAll: listTokens,
            created_time: Date.now(),
            updated_time: Date.now()
        };

        if (taskers.length > 0) {
            await NotificationService.insertMany(data);
        }
        // Create notification data for those users
        this.sendNotificationTasker(taskers, data);

        return { status: 'success' };
    }

    /**
     * Function send push noti to all user
     *@param {*} notificationData
     *@param {*} id
     */
    async pushNotificationAllUser(id: any) {
        let notification = await Pushnotification.findById(id);
        if (!notification) throw new HttpException(404, NOTIFICATION_NOT_FOUND);

        const users = await User.find();
        let listTokens: any = users.reduce((acc: any, user: any) => acc.concat(user._id), []);

        let data: any = {
            title: notification.title,
            body: notification.description,
            type_notification: {
                name: 'Notification vouncher all User'
            },
            isValidUser: true,
            userAll: listTokens,
            created_time: Date.now(),
            updated_time: Date.now()
        };

        if (users.length > 0) {
            await NotificationService.insertMany(data);
        }
        // Create notification data for those users
        this.sendNotificationUser(users, data);

        return { status: 'success' };
    }

    async sendNotificationUser(users: IFUser[], data: any) {
        //thực hiện lấy fcm_token lưu vào array trong fcm đồng thời lọc các fcm token giống nhau thì chỉ lấy 1 cái.
        let listTokens: string[] = users.reduce((acc, user) => acc.concat(user.fcm_token), []);
        listTokens = listTokens.filter((item, pos) => listTokens.indexOf(item) === pos);
        //thực hiện gửi req lên bao gồm data và list token do phía FE gửi lên lưu vào fcm_token database và lấy lưu vào database.
        FirebaseService.sendNotifications(listTokens, data);
    }

    async sendNotificationTasker(taskers: IFTasker[], data: any) {
        //thực hiện lấy fcm_token lưu vào array trong fcm đồng thời lọc các fcm token giống nhau thì chỉ lấy 1 cái.
        let listTokens: string[] = taskers.reduce((acc, tasker) => acc.concat(tasker.fcm_token), []);
        console.log(listTokens);
        listTokens = listTokens.filter((item, pos) => listTokens.indexOf(item) === pos);
        //thực hiện gửi req lên bao gồm data và list token do phía FE gửi lên lưu vào fcm_token database và lấy lưu vào database.
        FirebaseService.sendNotifications(listTokens, data);
    }
}
