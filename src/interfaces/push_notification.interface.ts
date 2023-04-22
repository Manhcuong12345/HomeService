import { Schema, Document } from 'mongoose';

export interface IFPushNotification extends Document {
    description: string;
    title: string;
    body: string;
    user: Schema.Types.ObjectId;
    tasker: Schema.Types.ObjectId;
    target_type: string;
    created_time: number;
    updated_time: number;
}
