import { Schema, Document } from 'mongoose';

export interface IFContact extends Document {
    contacts: {
        contact_user: [
            {
                name: string;
                description: string;
            }
        ];
        contact_tasker: [
            {
                name: string;
                description: string;
            }
        ];
    };

    created_time: number;
    updated_time: number;
}
