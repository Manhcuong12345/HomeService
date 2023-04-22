import { User, validate } from '../models/user.model';
import { pick } from 'lodash';
import { HttpException } from '../common';
import { filterRegisters } from '../lib/helper';
import { upload } from '../middlewares/cloud_upload.middleware';
import {
    EMAIL_AND_PHONENUMBER_EXIST,
    EMAIL_ALREADY_EXIST,
    PHONENUMBER_ALREADY_EXIST,
    USER_NOT_FOUND,
    INVALID_PASSWORD,
    SAME_THE_CHANGE_PASSWORD,
    UNAUTHORIZED
} from '../common/constants/err.constants';

export class UserService {
    private static instance: UserService;

    static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    /**
     * Check the phone number and email has been created or not, if it has already been created, it will not allow to create
     * Check password is not allowed to contain special characters
     * Returns true if valid, otherwise throws an httpexception
     *
     * @param {*} userData
     */
    async chekingDataBeforeCreate(userData: any) {
        const { error } = validate(userData);
        if (error) throw new HttpException(400, { error_code: '400', error_message: error.details[0].message });

        const existsPhoneEmail = await User.findOne({
            $and: [{ email: userData.email }, { phoneNumber: userData.phoneNumber }]
        });
        const existsPhone = await User.findOne({ phoneNumber: userData.phoneNumber });
        const existsEmail = await User.findOne({ email: userData.email });

        if (existsPhoneEmail) {
            throw new HttpException(400, EMAIL_AND_PHONENUMBER_EXIST);
        } else if (existsPhone) {
            if (existsPhone) throw new HttpException(400, PHONENUMBER_ALREADY_EXIST);
        } else if (existsEmail) {
            throw new HttpException(400, EMAIL_ALREADY_EXIST);
        }

        // password must not contain special characters
        const format = /[^a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+/;
        if (format.test(userData.password))
            throw new HttpException(1000, {
                error_code: '400',
                error_message: 'Password must not contain special characters'
            });

        return true;
    }

    /**
     * Check the phone number and email has been created or not, if it has already been created, it will not allow to create
     * Check password is not allowed to contain special characters
     * Returns true if valid, otherwise throws an httpexception
     *
     * @param {*} userData
     */
    async chekingDataBeforeUpdate(id: string, userData: any) {
        const existsPhoneEmail = await User.findOne({
            _id: { $ne: id },
            $or: [{ email: userData.email, phoneNumber: userData.phoneNumber }]
        });
        const existsPhone = await User.findOne({
            _id: { $ne: id },
            phoneNumber: userData.phoneNumber
        });
        const existsEmail = await User.findOne({ _id: { $ne: id }, email: userData.email });
        if (existsPhoneEmail) {
            throw new HttpException(400, EMAIL_AND_PHONENUMBER_EXIST);
        } else if (existsPhone) {
            throw new HttpException(400, PHONENUMBER_ALREADY_EXIST);
        } else if (existsEmail) {
            throw new HttpException(400, EMAIL_ALREADY_EXIST);
        }

        return true;
    }

    /**
     *Function create user
     * @param {*} userData
     * @returns
     */
    async createUser(userData: any) {
        await this.chekingDataBeforeCreate(userData);

        const user = new User(userData);
        userData.createdAt = null;
        user.created_time = Date.now();
        user.updated_time = Date.now();

        await user.hashPassword();
        await user.save();

        return user;
    }

    /**
     * Function used to create filters
     * help filter data based on user data and user submitted data (search_string)
     *
     * @param {*} search_string
     * @param {*} user
     * @returns
     */
    getFilter(search_string: string, user: any) {
        let filter: any = {};

        if (search_string) {
            filter.$or = [
                { name: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } },
                { email: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } },
                { phoneNumber: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } },
                { authType: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } }
            ];
        }

        filterRegisters(filter);

        return filter;
    }

    /**
     * Function used to get data of all users and pagination
     *
     * @param {*} param0
     * @param {*} user
     * @returns
     */
    async getAllUsersAndPaging(
        { page, limit, search_string }: { page?: number; limit?: number; search_string?: string },
        user: any
    ) {
        if (!page || page <= 0) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }

        let skip = 0;
        skip = (page - 1) * limit;

        const filter = this.getFilter(search_string, user);

        const users = await User.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ created_time: 'desc' })
            .select('-password')
            .select('-fcm-token')
            .select('-otp');

        const documentCount = await User.countDocuments(filter);

        const response = {
            data: users,
            meta_data: {
                total_records: documentCount,
                page: page,
                limit: limit,
                total_page: Math.ceil(documentCount / Number(limit))
            }
        };

        return response;
    }

    /**
     * Function to get user data by token
     *
     * @param {*} user
     * @return
     */
    async getMe(user: any) {
        if (user.type !== 'User') throw new HttpException(401, UNAUTHORIZED);

        const me = await User.findById(user._id).select('-password');
        if (!me) throw new HttpException(404, USER_NOT_FOUND);

        return me;
    }

    /**
     * Function get id of user data
     *
     * @param {*} id
     * @param {*} user
     * @return
     */
    async getUserById(id: string, user: any) {
        const users = await User.findById(id).select('-password').select('-fcm_token');
        if (!users) throw new HttpException(404, USER_NOT_FOUND);

        return users;
    }

    /**
     * Function update user data
     *
     * @param {*} userData
     * @param {*} id
     * @param {*} user
     * @return
     *
     */
    async updateUser(id: string, userData: any, user: any) {
        if (user.type == 'Tasker') throw new HttpException(401, UNAUTHORIZED);
        await this.chekingDataBeforeUpdate(id, userData);

        const users = await User.findByIdAndUpdate(id, userData, { new: true }).select('-password');
        if (!users) throw new HttpException(404, USER_NOT_FOUND);
        users.updated_time = Date.now();

        return users;
    }

    /**
     * Function delete user data
     *
     * @param {*} id
     * @param {*} user
     * @return
     */
    async deleteUser(id: string, user: any) {
        if (user.type !== 'Admin') throw new HttpException(401, UNAUTHORIZED);

        const users = await User.findByIdAndDelete(id);
        if (!users) throw new HttpException(400, USER_NOT_FOUND);

        return users;
    }

    /**
     * Function changePassword in profile user
     * @param {*} id
     * @param {*} password
     * @param {*} new_password
     * @return
     */
    async changePassword(id: any, password: string, new_password: string) {
        //check id user if not found id user
        const user = await User.findById(id);
        if (!user) throw new HttpException(401, UNAUTHORIZED);

        //check compare password old if password old wrong => error
        const password_old = await user.comparePassword(password);
        if (!password_old) throw new HttpException(400, INVALID_PASSWORD);

        //create password new
        user.password = new_password;
        //check password old and new password if new == old then error
        if (password === new_password) throw new HttpException(400, SAME_THE_CHANGE_PASSWORD);

        await user.hashPassword();
        await user.save();

        return user;
    }

    /**
     * Function upload file image avatar to by token
     * @param id
     * @param userData
     * @returns
     */
    async uploadFile(id: any, userData: any) {
        //config url link file then send url to cloud google storage data img and save url avatar in database
        const fileAvatar = await upload(userData);
        if (!fileAvatar) throw new HttpException(400, { error_code: '400', error_message: '' });

        userData.avatar = fileAvatar;

        const user = await User.findByIdAndUpdate(id, userData, { new: true }).select('-password');
        if (!user) throw new HttpException(400, USER_NOT_FOUND);
        user.updated_time = Date.now();

        return user;
    }
}
