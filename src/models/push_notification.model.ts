import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';
import { IFPushNotification } from '../interfaces/push_notification.interface';

const PushNotificationSchema = new Schema({
    description: {
        type: String
    },
    title: {
        type: String
    },
    target_type: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId
    },
    tasker: {
        type: Schema.Types.ObjectId
    },
    multipleLanguagesBody: {
        en: { type: String },
        vi: { type: String }
    },
    created_time: {
        type: Number,
        default: Date.now()
    },
    createdAt: {
        type: Date,
        expires: 2592000,
        default: Date.now()
    },
    updated_time: {
        type: Number,
        default: Date.now()
    }
});

//Schema middleware
PushNotificationSchema.pre('findOneAndUpdate', function () {
    const data: any = this.getUpdate();
    data.updated_time = new Date();
});

export const Pushnotification = mongoose.model<IFPushNotification>('Pushnotification', PushNotificationSchema);
