import { Schema, Document } from 'mongoose';

export interface IFTasker extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    address: string;
    avatar: string;
    phoneNumber: string;
    orderId: string;
    updated_time: number;
    locale: string;
    created_time: number;
    user_note: string;
    amount: number;
    bankCode: number;
    orderInfo: string;
    orderType: string;
    createDate: string;
    is_active: boolean;
    createdAt: number;
    account_number: number;
    payment_method: string;
    // total_task: Schema.Types.ObjectId[];
    total_give_task: Schema.Types.ObjectId[];
    fail_task: Schema.Types.ObjectId[];
    success_task: Schema.Types.ObjectId[];
    number_success: string[];
    gender: string;
    otp: string;
    list_pictures_household: string[];
    list_pictures_crimerecords: string[];
    fcm_token: string[];
    academic_level: string;
    medals: [
        {
            name: string;
            total: number;
        }
    ];
    total_rating: number;
    num_review: number;
    comments: [
        {
            description: string;
            user: {
                _id: Schema.Types.ObjectId;
                name: string;
            };
            task: Schema.Types.ObjectId;
            ratting: number;
        }
    ];
    date_providers: string;
    identity_card: number;
    providers: string;
    level_english: string;
    province: {
        code: number;
        name: string;
        division_type: string;
    };
    district: {
        code: number;
        name: string;
        division_type: string;
        province_code: number;
    };
    wards: {
        code: number;
        name: string;
        division_type: string;
        district_code: number;
    };
    generateToken(): string;
    hashPassword(): void;
    comparePassword(password: string): boolean;
}
