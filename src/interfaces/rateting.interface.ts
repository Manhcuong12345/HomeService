import { Schema, Document } from 'mongoose';

export interface IFRateting extends Document {
    heraldic: [
        {
            name: string;
            total: number;
        }
    ];
    comments: [
        {
            description: string;
            user: {
                _id: Schema.Types.ObjectId;
                name: string;
                phoneNumber: string;
            };
            rating: {
                type: number;
            };
        }
    ];
    created_time: number;
    updated_time: number;
}
