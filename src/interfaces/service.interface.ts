import { Schema, Document } from 'mongoose';

export interface IFService extends Document {
    _id: string;
    name: string;
    multipleLanguageName: {
        vi: string;
        en: string;
    };
    img: string;
    options: [
        {
            name: string;
            price: number;
            quantity: number;
            note: string;
        }
    ];
    payments: [
        {
            name: string;
            is_active: number;
        }
    ];
    option_type: number;
    is_active: boolean;
    created_time: number;
    updated_time: number;
}
