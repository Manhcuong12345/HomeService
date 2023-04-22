import mongoose, { Schema } from 'mongoose';
import { config } from '../config/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Task } from '../models/task.model';
import { IFTasker } from '../interfaces/tasker.interface';
import Joi from 'joi';

const TaskerSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    province: {
        code: { type: Number },
        name: { type: String },
        division_type: { type: String }
    },
    district: {
        code: { type: Number },
        name: { type: String },
        division_type: { type: String },
        province_code: { type: Number }
    },
    wards: {
        code: { type: Number },
        name: { type: String },
        division_type: { type: String },
        district_code: { type: Number }
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'others']
    },
    money: {
        type: Number
    },
    account_number: {
        type: Number
    },
    payment_method: {
        type: String
    },
    academic_level: {
        type: String
    },
    identity_card: {
        type: Number
    },
    providers: {
        type: String
    },
    date_providers: {
        type: String
    },
    level_english: {
        type: String
    },
    list_pictures_household: [
        {
            type: String
        }
    ],
    list_pictures_crimerecords: [
        {
            type: String
        }
    ],
    otp: {
        type: String
    },
    fcm_token: [
        {
            type: String
        }
    ],
    is_active: {
        type: Boolean,
        default: true
    },
    // total_task: [{ type: Schema.Types.ObjectId }],
    total_give_task: [{ type: Schema.Types.ObjectId }],
    success_task: [{ type: Schema.Types.ObjectId }],
    fail_task: [{ type: Schema.Types.ObjectId }],
    medals: [
        {
            name: {
                type: String
            },
            total: {
                type: Number,
                default: 0
            }
        }
    ],
    num_review: {
        type: Number,
        default: 0
    },
    total_rating: {
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
                }
            },
            task: {
                type: Schema.Types.ObjectId
            },
            rating: {
                type: Number
            }
        }
    ],
    bankCode: {
        type: String
    },
    orderType: {
        type: String
    },
    orderId: {
        type: Number
    },
    orderInfo: {
        type: String
    },
    amount: {
        type: Number
    },
    createDate: {
        type: String
    },
    locale: {
        type: String
    },
    createdAt: {
        type: Date
        // default: Date.now() + 30 * 60 * 1000
    },
    created_time: {
        type: Number
    },
    updated_time: {
        type: Number
    },
    user_updated: {
        type: Schema.Types.ObjectId
    }
});

/**
 * Function generateToken when login user
 * @returns
 */
TaskerSchema.methods.generateToken = function (): string {
    const data = {
        _id: this._id,
        email: this.email,
        type: 'Tasker'
    };

    return jwt.sign(data, config.get('jwtKey'));
};

/**
 * Function hashPassword to create password
 * @returns
 */
TaskerSchema.methods.hashPassword = async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
};

export function validate(tasker: any) {
    const schema = Joi.object().keys({
        id: Joi.string().allow(null).allow(''),
        name: Joi.string().allow(''),
        email: Joi.string()
            .email()
            .required()
            .allow('')
            .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
        password: Joi.string().allow('').required(),
        // .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
        phoneNumber: Joi.string()
            .allow('')
            .regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/),
        address: Joi.string().allow(''),
        gender: Joi.string().allow(null).allow(''),
        updated_time: Joi.number().allow(null).allow(''),
        created_time: Joi.number().allow(null).allow(''),
        account_number: Joi.number().allow(null).allow(),
        payment_method: Joi.string().allow(null).allow(),
        user_created: Joi.string().allow(null).allow(''),
        user_updated: Joi.string().allow(null).allow(''),
        academic_level: Joi.string().allow(null).allow(''),
        identity_card: Joi.number().allow(null).allow(''),
        providers: Joi.string().allow(null).allow(''),
        date_providers: Joi.string().allow(null).allow(''),
        level_english: Joi.string().allow(null).allow('')
    });
    return schema.validate(tasker);
}

/**
 * Function comparePassword when create password
 * @returns
 */
TaskerSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

//Schema middleware
TaskerSchema.pre('findOneAndUpdate', function () {
    const data: any = this.getUpdate();
    data.updated_time = new Date();
});

///Funtion sync data when update data to Tasker
async function syncDataWhenUpdate(doc: any) {
    await Task.updateMany({ 'tasker._id': doc._id }, { $set: { tasker: doc } });
}

//Function update data tasker in Task when update data to Tasker
TaskerSchema.post('findOneAndUpdate', function (doc) {
    syncDataWhenUpdate(doc);
});

export const Tasker = mongoose.model<IFTasker>('Tasker', TaskerSchema);
