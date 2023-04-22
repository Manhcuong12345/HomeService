import { Schema, Document } from 'mongoose';

export interface IFTask extends Document {
    _id: string;
    // location_gps: {
    //     lat: string;
    //     long: string;
    // };
    address: {
        lat: string;
        long: string;
        name: string;
        sub_name: string;
        location: string;
    };
    failure_reason: {
        reason: string;
        user: {
            _id: Schema.Types.ObjectId;
            name: string;
        };
        tasker: {
            _id: Schema.Types.ObjectId;
            name: string;
        };
    };
    note: string;
    start_time: number;
    status: number;
    language: number;
    estimate_time: string;
    end_time: number;
    total_task: Schema.Types.ObjectId[];
    date: number;
    is_rating: boolean;
    total_price: number;
    user_deleted: boolean;
    tasker_deleted: boolean;
    admin_deleted: boolean;
    type_home: number;
    list_pictures_before: string[];
    list_pictures_after: string[];
    check_list: [
        {
            name: string;
            status: boolean;
        }
    ];
    posted_user: {
        _id: Schema.Types.ObjectId;
        name: string;
        phoneNumber: string;
        address: string;
        email: string;
        created_time: number;
        deleted_time: number;
        avatar: string;
        fcm_token: string[];
    };
    tasker: {
        _id: Schema.Types.ObjectId;
        name: string;
        phoneNumber: string;
        address: string;
        email: string;
        is_deleted: boolean;
        deleted_time: number;
        receive_time: number;
        avatar: string;
        fcm_token: string[];
    };
    selected_option: [
        {
            _id: string;
            name: string;
            price: number;
            quantity: number;
            note: string;
        }
    ];
    service: {
        _id: string;
        name: string;
        multipleLanguageName: {
            vi: string;
            en: string;
        };
        options: [
            {
                _id: string;
                name: string;
                price: number;
                quantity: number;
                note: string;
                is_selected: boolean;
            }
        ];
        payments: [
            {
                name: string;
                is_active: boolean;
            }
        ];
        option_type: number;
        img: string;
    };
    created_time: number;
    updated_time: number;
}
