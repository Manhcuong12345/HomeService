import { Schema, Document } from 'mongoose';

export interface IFNotification extends Document {
    title: string;
    body: string;
    read: boolean;
    type_notification: {
        name: string;
        status: number;
    };
    userAll: Schema.Types.ObjectId[];
    taskerAll: Schema.Types.ObjectId[];
    admin: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
    tasker: Schema.Types.ObjectId;
    isValidUser: boolean;
    isValidTasker: boolean;
    created_time: number;
    updated_time: number;
    createdAt: number;
}
