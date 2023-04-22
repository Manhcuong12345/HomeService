import { Schema, Document } from 'mongoose';

export interface IFUser extends Document {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    password: string;
    phoneNumber: string;
    address: string;
    authType: string;
    authGoogleId: string;
    authFacebookId: string;
    account_number: number;
    payment_method: string;
    task_active: boolean;
    gender: string;
    createdAt: number;
    service_used: Schema.Types.ObjectId[];
    fail_task: Schema.Types.ObjectId[];
    success_task: Schema.Types.ObjectId[];
    account_money: number;
    is_active: boolean;
    otp: string;
    fcm_token: string[];
    user_updated: Schema.Types.ObjectId;
    created_time: number;
    updated_time: number;
    generateToken(): string;
    hashPassword(): void;
    comparePassword(password: string): boolean;
}
