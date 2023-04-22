import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';
import { IFService } from '../interfaces/service.interface';
import { Task } from './task.model';

const ServiceSchema = new Schema({
    name: {
        type: String
    },
    translation: [
        {
            language: { type: String },
            name: { type: String }
        }
    ],
    img: {
        type: String
    },
    is_active: {
        type: Boolean,
        default: false
    },
    options: [
        {
            name: {
                type: String
            },
            price: {
                type: Number
            },
            quantity: {
                type: Number
            },
            note: {
                type: String
            }
        }
    ],
    payments: [
        {
            name: {
                type: String
            },
            is_active: {
                type: Boolean,
                default: false
            }
        }
    ],
    option_type: {
        type: Number,
        enum: [0, 1, 2] //0:theo giờ, 1:theo phòng, 2:khác
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

// Schema middleware
ServiceSchema.pre('findOneAndUpdate', function () {
    const data: any = this.getUpdate();
    data.updated_time = Date.now();
});

async function syncDataWhenUpdate(doc: any) {
    await Task.updateMany({ 'service._id': doc._id }, { $set: { service: doc } });
}

ServiceSchema.post('findOneAndUpdate', function (doc) {
    syncDataWhenUpdate(doc);
});

export const Service = mongoose.model<IFService>('Service', ServiceSchema);
