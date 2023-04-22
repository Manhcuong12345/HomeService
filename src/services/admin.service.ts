import { Admin } from '../models/admin.model';
import { HttpException } from '../common';
import { pick } from 'lodash';
import { upload } from '../middlewares/cloud_upload.middleware';
import {
    EMAIL_ALREADY_EXIST,
    ADMIN_NOT_FOUND,
    INVALID_PASSWORD,
    SAME_THE_CHANGE_PASSWORD
} from '../common/constants/err.constants';

export class AdminService {
    private static instance: AdminService;

    static getInstance(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }

    /**
     * Check the phone number and email has been created or not, if it has already been created, it will not allow to create
     * Check password is not allowed to contain special characters
     * Returns true if valid, otherwise throws an httpexception
     *
     * @param {*} adminData
     */
    async chekingDataBeforeCreate(adminData: any) {
        const existsAdmin = await Admin.findOne({
            $or: [{ email: adminData.email }, { phoneNumber: adminData.phoneNumber }]
        });
        if (existsAdmin) throw new HttpException(400, EMAIL_ALREADY_EXIST);

        // password must not contain special characters
        const format = /[^a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+/;
        if (format.test(adminData.password))
            throw new HttpException(400, {
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
     * @param {*} adminData
     * @param {*} id
     */
    async chekingDataBeforeUpdate(id: any, adminData: any) {
        const existsAdmin = await Admin.findOne({
            _id: { $ne: id },
            $or: [{ email: adminData.email }, { phoneNumber: adminData.phoneNumber }]
        });
        if (existsAdmin) throw new HttpException(400, EMAIL_ALREADY_EXIST);

        return true;
    }

    /**
     *Function create user data
     * @param {*} adminData
     */
    async createAdmin(adminData: any) {
        await this.chekingDataBeforeCreate(adminData);

        let admin = new Admin(adminData);
        admin.hashPassword();
        await admin.save();

        return admin;
    }

    /**
     * Function used to create filters
     * help filter data based on user data and user submitted data (search_string)
     * @param {*} search_string
     * @param {*} user
     * @returns
     */
    getFilter(search_string: string, user: any) {
        const filter: any = {};

        if (search_string) {
            filter.$or = [
                { name: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } },
                { email: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } },
                { phoneNumber: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } }
            ];
        }

        return filter;
    }

    /**
     * Function used to get data of all users and pagination
     *
     * @param {*} param0
     * @param {*} user
     * @returns
     */
    async getAllAdminAndPaging(
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

        const admins = await Admin.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ created_time: 'desc' })
            .select('-password')
            .select('-otp')
            .select('-fcm-token');
        const documentCount = await Admin.countDocuments(filter);

        const response = {
            data: admins,
            meta_data: {
                total_records: documentCount,
                limit: limit,
                page: page,
                total_page: Math.ceil(documentCount / Number(limit))
            }
        };

        return response;
    }

    /**
     * Function to get user data by token
     * @param {*} user
     * @return
     */
    async getMe(user: any) {
        const me = await Admin.findById(user._id).select('-password');
        if (!me) throw new HttpException(404, ADMIN_NOT_FOUND);

        return me;
    }

    /**
     * Function get id of user data
     *
     * @param {*} id
     * @return
     */
    async getAdminById(id: string) {
        const admin = await Admin.findById(id).select('-password');
        if (!admin) throw new HttpException(404, ADMIN_NOT_FOUND);

        return admin;
    }

    /**
     * Function update admin,token data
     * @param {*} id
     * @param {*} adminData
     * @returns
     */
    async updateAdmin(id: any, adminData: any) {
        await this.chekingDataBeforeUpdate(id, adminData);

        // adminData = pick(adminData, ['name', 'phoneNumber', 'address', 'gender', 'updated_time']);

        const admin = await Admin.findByIdAndUpdate(id, adminData, { new: true }).select('-password');
        if (!admin) throw new HttpException(404, ADMIN_NOT_FOUND);

        return admin;
    }

    /**
     * Function delete user data
     * @param {*} id
     * @return
     */
    async deleteAdmin(id: string) {
        const admin = await Admin.findByIdAndDelete(id);
        if (!admin) throw new HttpException(404, ADMIN_NOT_FOUND);

        return admin;
    }

    /**
     * Function changePassword in profile admin
     * @param {*} id
     * @param {*} password
     * @param {*} new_password
     * @return
     */
    async changePassword(id: any, password: string, new_password: string) {
        //check id user if not found id user
        const admin = await Admin.findById(id);

        //check compare password old if password old wrong => error
        const password_old = await admin.comparePassword(password);
        if (!password_old) throw new HttpException(400, INVALID_PASSWORD);

        //create password new
        admin.password = new_password;
        //check password old and new password if new == old then error
        if (password === new_password) throw new HttpException(400, SAME_THE_CHANGE_PASSWORD);

        await admin.hashPassword();
        await admin.save();

        return admin;
    }

    /**
     * Function upload file image avatar
     * @param id
     * @param adminData
     * @returns
     */
    async uploadFile(id: string, adminData: any) {
        const admin = await Admin.findByIdAndUpdate(id, adminData, { new: true }).select('-password');
        if (!admin) throw new HttpException(400, { error_code: '400', error_message: 'Admin is not found' });

        //config url link file then send url to cloud google storage data img and save url avatar in database
        let fileAvatar = await upload(adminData);
        admin.avatar = fileAvatar;
        if (!fileAvatar) throw new HttpException(400, { error_code: '400', error_message: '' });

        await admin.save();
        return admin;
    }
}
