import mongoose, { Schema } from 'mongoose';
import { IFRateting } from '../interfaces/rateting.interface';

const RatetingSchema = new Schema({
    medal: [
        {
            name: {
                type: String
            },
            total: {
                type: Number
            }
        }
    ],
    num_reviews: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    comments: [
        {
            description: {
                type: String
            },
            user: {
                _id: {
                    type: Schema.Types.ObjectId
                },
                name: {
                    type: String
                },
                phoneNumber: {
                    type: String
                }
            },
            rating: {
                type: Number
            }
        }
    ],
    created_time: {
        type: Number,
        default: Date.now()
    },
    updated_time: {
        type: Number,
        default: Date.now()
    }
});

export const Rateting = mongoose.model<IFRateting>('Rateting', RatetingSchema);
