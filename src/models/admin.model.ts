import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import bcrypt from 'bcrypt';
import { IFAdmin } from '../interfaces/admin.interface';

const AdminSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    avatar: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    address: {
        type: String,
        maxlength: 500
    },
    password: {
        type: String
    },
    gender: {
        type: String
    },
    otp: {
        type: String
    },
    super_admin: {
        type: Boolean,
        default: false
    },
    fcm_token: [
        {
            type: String
        }
    ],
    user_updated: {
        type: Schema.Types.ObjectId
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

/**
 * Function generateToken when login user
 * @returns
 */
AdminSchema.methods.generateToken = function (): string {
    const data = {
        _id: this._id,
        email: this.email,
        type: 'Admin'
    };

    return jwt.sign(data, config.get('jwtKey'));
};

/**
 * Function hashPassword to create password
 * @returns
 */
AdminSchema.methods.hashPassword = async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
};

/**
 * Function comparePassword when create password
 * @returns
 */
AdminSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

/**
 * Function validate user
 * @returns
 */
export function validateAdmin(admin: any) {
    const schema = Joi.object().keys({
        name: Joi.string().min(5).max(50),
        email: Joi.string().email(),
        password: Joi.string().min(5).max(255),
        phoneNumber: Joi.number().allow(null).allow(''),
        gender: Joi.string().allow(null).allow(''),
        address: Joi.string().max(500).allow(null).allow(''),
        super_admin: Joi.boolean().allow(null).allow(''),
        updated_time: Joi.number().allow(null).allow(''),
        created_time: Joi.number().allow(null).allow(''),
        user_updated: Joi.string().allow(null).allow('')
    });
    return schema.validate(admin);
}

export const Admin = mongoose.model<IFAdmin>('Admin', AdminSchema);
