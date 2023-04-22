import mongoose, { Schema } from 'mongoose';
import { IFContact } from '../interfaces/contact.interface';

const ContactSchema = new Schema({
    contacts: {
        contact_user: [
            {
                name: {
                    type: String
                },
                description: {
                    type: String
                }
            }
        ],
        contact_tasker: [
            {
                name: {
                    type: String
                },
                description: {
                    type: String
                }
            }
        ]
    },
    created_time: {
        type: Number,
        default: Date.now()
    },
    updated_time: {
        type: Number,
        default: Date.now()
    }
});

export const Contact = mongoose.model<IFContact>('Contact', ContactSchema);
