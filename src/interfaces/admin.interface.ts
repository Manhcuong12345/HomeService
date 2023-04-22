import { Schema, Document } from 'mongoose';

export interface IFAdmin extends Document {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    avatar: string;
    gender: string;
    otp: string;
    fcm_token: string[];
    created_time: number;
    updated_time: number;
    generateToken(): string;
    hashPassword(): void;
    comparePassword(password: string): boolean;
}
