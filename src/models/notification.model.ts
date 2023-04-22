import mongoose, { Schema } from 'mongoose';
import { IFNotification } from '../interfaces/notification.interface';

const NotificationSchema = new Schema({
    title: {
        type: String
    },
    body: {
        type: String
    },
    multipleLanguagesBody: {
        en: { type: String },
        vi: { type: String }
    },
    user: {
        type: Schema.Types.ObjectId
    },
    tasker: {
        type: Schema.Types.ObjectId
    },
    admin: {
        type: Schema.Types.ObjectId
    },
    userAll: [
        {
            type: Schema.Types.ObjectId
        }
    ],
    taskerAll: [{ type: Schema.Types.ObjectId }],
    taskId: { type: Schema.Types.ObjectId },
    isValidUser: {
        type: Boolean
    },
    isValidTasker: {
        type: Boolean
    },
    type_notification: {
        name: {
            type: String
        },
        status: {
            type: Number,
            enum: [0, 1, 2, 3, 4] // noti tasker nhan task, noti tasker huy task, noti tasker hoan thanh task
            //noti user tao task moi ,noti user huy task
        }
    },
    read: {
        type: Boolean,
        default: false
    },
    created_time: {
        type: Number
    },
    createdAt: {
        type: Date,
        expires: 2592000,
        default: Date.now()
    },
    updated_time: {
        type: Number
    }
});

export const Notification = mongoose.model<IFNotification>('Notification', NotificationSchema);
