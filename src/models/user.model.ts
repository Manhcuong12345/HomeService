import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/config';
import { IFUser } from '../interfaces/user.interface';
import { Task } from '../models/task.model';
import Joi from 'joi';

const UserSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
        // required: true
    },
    avatar: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    address: {
        type: String
    },
    password: {
        type: String
        // required: true
    },
    authType: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        default: 'local'
    },
    authGoogleId: {
        type: String,
        default: null
    },
    authFacebookId: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'others']
    },
    account_money: {
        type: Number
    },
    account_number: {
        type: Number
    },
    payment_method: {
        type: String
    },
    otp: {
        type: String
    },
    fcm_token: [
        {
            type: String
        }
    ],
    task_active: {
        type: Boolean
    },
    service_used: [{ type: Schema.Types.ObjectId }],
    success_task: [{ type: Schema.Types.ObjectId }],
    fail_task: [{ type: Schema.Types.ObjectId }],
    created_time: {
        type: Number
    },
    updated_time: {
        type: Number
    },
    is_active: {
        type: Boolean,
        default: false
    },
    user_created: {
        type: Schema.Types.ObjectId
    },
    user_updated: {
        type: Schema.Types.ObjectId
    }
    // createdAt: {
    //     type: Date
    //     // default: Date.now() + 1 * 60 * 1000
    // }
});

/**
 * Function generateToken when login user
 * @returns
 */
UserSchema.methods.generateToken = function (): string {
    const data = {
        _id: this._id,
        email: this.email,
        type: 'User'
    };

    return jwt.sign(data, config.get('jwtKey'));
};

/**
 * Function hashPassword to create password
 * @returns
 */
UserSchema.methods.hashPassword = async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
};

/**
 * Function comparePassword when create password
 * @returns
 */
UserSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

//Function validate schema
export function validate(user: any) {
    const schema = Joi.object().keys({
        id: Joi.string().allow(null).allow(''),
        name: Joi.string().allow(''),
        email: Joi.string()
            .email()
            .required()
            .allow('')
            // .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
            .regex(/[a-zA-Z0-9_\.\+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+/),
        password: Joi.string().required().allow(''),
        // .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
        phoneNumber: Joi.string()
            .allow('')
            .regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/),
        address: Joi.string().allow(''),
        gender: Joi.string().allow(null).allow(''),
        updated_time: Joi.number().allow(null).allow(''),
        created_time: Joi.number().allow(null).allow(''),
        user_created: Joi.string().allow(null).allow(''),
        user_updated: Joi.string().allow(null).allow(''),
        account_number: Joi.number().allow(null).allow(''),
        file_name: Joi.string().allow(null).allow(''),
        payment_method: Joi.string().allow(null).allow('')
    });
    return schema.validate(user);
}

//Schema middleware
UserSchema.pre('findOneAndUpdate', function () {
    const data: any = this.getUpdate();
    data.updated_time = Date.now();
});

// Funtion sync data when update data to User
async function syncDataWhenUpdate(doc: any) {
    await Task.updateMany({ 'posted_user._id': doc._id }, { $set: { posted_user: doc } });
}

//Function update data postedUser in Task when update data to User
UserSchema.post('findOneAndUpdate', function (doc) {
    syncDataWhenUpdate(doc);
});

// //Funtion sync data when delete data to User
// async function syncDataWhenDelete(doc: any) {
//     await Task.deleteMany({ 'posted_user._id': doc._id });
// }

// //Function delete data postedUser in Task when update data to User
// UserSchema.post('findOneAndDelete', function (doc) {
//     syncDataWhenDelete(doc);
// });

export const User = mongoose.model<IFUser>('User', UserSchema);
