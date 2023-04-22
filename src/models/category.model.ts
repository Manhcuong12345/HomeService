import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';

const CategorySchema = new Schema({
    name: {
        type: String
    },
    translation: [
        {
            language: { type: String },
            name: { type: String }
        }
    ],
    units: [
        {
            type: Number,
            enum: [1, 2, 3] // 1: By Hour, 2: By acreage, 3: By dish
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

export const Category = mongoose.model('Category', CategorySchema);
