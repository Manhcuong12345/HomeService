import { Tasker } from '../models/tasker.model';
import { pick } from 'lodash';
import { User } from '../models/user.model';
import { HttpException } from '../common';
import { filterRegisters } from '../lib/helper';
import { uploadManyFiles, bucket, upload } from '../middlewares/cloud_upload.middleware';
import {
    EMAIL_AND_PHONENUMBER_EXIST,
    EMAIL_ALREADY_EXIST,
    PHONENUMBER_ALREADY_EXIST,
    INVALID_PASSWORD,
    UNAUTHORIZED,
    SAME_THE_CHANGE_PASSWORD,
    TASKER_NOT_FOUND
} from '../common/constants/err.constants';
import { config } from '../config/config';
import querystring from 'qs';
import moment from 'moment';
import crypto from 'crypto';

export class TaskerService {
    private static instance: TaskerService;

    static getInstance(): TaskerService {
        if (!TaskerService.instance) {
            TaskerService.instance = new TaskerService();
        }
        return TaskerService.instance;
    }

    /**
     * Check the phone number and email has been created or not, if it has already been created, it will not allow to create
     * Check password is not allowed to contain special characters
     * Returns true if valid, otherwise throws an httpexception
     *
     * @param {*} taskerData
     */
    async chekingDataBeforeCreate(taskerData: any) {
        // // const { error } = validate(taskerData);
        // if (error) throw new HttpException(400, { error_code: '400', error_message: error.details[0].message });
        const existsTasker = await Tasker.findOne({
            $or: [{ email: taskerData.email }, { phoneNumber: taskerData.phoneNumber }]
        });
        if (existsTasker) throw new HttpException(400, EMAIL_AND_PHONENUMBER_EXIST);

        // password must not contain special characters
        const format = /[^a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+/;
        if (format.test(taskerData.password))
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
     * @param {*} taskerData
     * @param {*} id
     */
    async chekingDataBeforeUpdate(id: string, taskerData: any) {
        const existsPhoneEmail = await Tasker.findOne({
            _id: { $ne: id },
            $and: [{ email: taskerData.email, phoneNumber: taskerData.phoneNumber }]
        });
        const existsPhone = await Tasker.findOne({
            _id: { $ne: id },
            phoneNumber: taskerData.phoneNumber
        });
        const existsEmail = await Tasker.findOne({ _id: { $ne: id }, email: taskerData.email });
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
     *
     * @param {*} taskerData
     * @param {*} user
     * @returns
     */
    async createTasker(user: any, taskerData: any) {
        // await this.chekingDataBeforeCreate(taskerData);
        if (user.type !== 'Admin') throw new HttpException(401, UNAUTHORIZED);

        // const tmnCode = config.get('vnp_TmnCode');
        // const secretKey = config.get('vnp_HashSecret');
        // let vnpUrl = config.get('vnp_Url');
        // const returnUrl = config.get('vnp_ReturnUrl');

        // const date = moment();
        // const created = date.format('yyyyMMDDHHmmss');

        // // taskerData.createDate = created;
        // // const locale = taskerData.locale;
        // // if (locale === null || locale === '') {
        // //     locale: string = 'vn';
        // // }
        // const bankCode = taskerData.bankCode;

        // const currCode = 'VND';
        // let vnp_Params: any = {};
        // vnp_Params['vnp_Version'] = '2.1.0';
        // vnp_Params['vnp_Command'] = 'pay';
        // vnp_Params['vnp_TmnCode'] = tmnCode;
        // vnp_Params['vnp_Locale'] = taskerData.locale;
        // vnp_Params['vnp_CurrCode'] = currCode;
        // vnp_Params['vnp_TxnRef'] = taskerData.orderId;
        // vnp_Params['vnp_OrderInfo'] = taskerData.orderInfo;
        // vnp_Params['vnp_OrderType'] = taskerData.orderType;
        // vnp_Params['vnp_Amount'] = taskerData.amount * 100;
        // vnp_Params['vnp_CreateDate'] = created;
        // vnp_Params['vnp_IpAddr'] = ipAddr;
        // vnp_Params['vnp_ReturnUrl'] = returnUrl;
        // if (bankCode && bankCode !== '') {
        //     vnp_Params['vnp_BankCode'] = bankCode;
        // }

        const tasker = new Tasker(taskerData);

        // vnp_Params = this.sortObject(vnp_Params);

        // let signData = querystring.stringify(vnp_Params, { encode: false });
        // let hmac: any = crypto.createHmac('sha512', secretKey);
        // let signed: string = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
        // vnp_Params['vnp_SecureHash'] = signed;
        // vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
        // console.log(vnpUrl);

        tasker.created_time = Date.now();
        tasker.updated_time = Date.now();
        await tasker.hashPassword();
        await tasker.save();

        return tasker;
    }

    // sortObject(obj: any) {
    //     var sorted: any = {};
    //     var str: any = [];
    //     var key;
    //     for (key in obj) {
    //         if (obj.hasOwnProperty(key)) {
    //             str.push(encodeURIComponent(key));
    //         }
    //     }
    //     str.sort();
    //     for (key = 0; key < str.length; key++) {
    //         sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    //     }
    //     return sorted;
    // }

    // async getReturnPayment(vnp_Params: any) {
    //     const secureHash = vnp_Params['vnp_SecureHash'];

    //     delete vnp_Params['vnp_SecureHash'];
    //     delete vnp_Params['vnp_SecureHashType'];

    //     vnp_Params = this.sortObject(vnp_Params);

    //     const tmnCode = config.get('vnp_TmnCode');
    //     const secretKey = config.get('vnp_HashSecret');

    //     const querystring = require('qs');
    //     const signData = querystring.stringify(vnp_Params, { encode: false });
    //     const crypto = require('crypto');
    //     const hmac = crypto.createHmac('sha512', secretKey);
    //     const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    //     if (secureHash === signed) {
    //         //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
    //         return { status: 'success', code: vnp_Params['vnp_ResponseCode'] };
    //     } else {
    //         return { status: 'success', code: '97' };
    //     }
    // }

    /**
     * Function used to create filters
     * help filter data based on user data and tasker submitted data (search_string)
     *
     * @param {*} search_string
     * @param {*} user
     * @returns
     */
    getFilter(search_string: string, active: boolean, gender: string) {
        let filter: any = {};

        if (search_string) {
            filter.$or = [
                { name: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } },
                // { email: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } },
                { phoneNumber: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } }
            ];
        }
        if (active) {
            filter = { is_active: active };
        }
        if (gender) {
            filter = { gender: gender };
        }
        //search active and gender neu one in 2 not found then not data
        if (active && gender) {
            filter = { is_active: active, gender: gender };
        }

        return filter;
    }

    /**
     * Function used to get data of all taskers and pagination
     *
     * @param {*} param0
     * @param {*} user
     * @returns
     */
    async getAllTaskersAndPaging(
        {
            page,
            limit,
            search_string,
            active,
            gender
        }: { page?: number; limit?: number; search_string?: string; active?: boolean; gender?: string },
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

        const filter = this.getFilter(search_string, active, gender);

        const taskers = await Tasker.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ created_time: 'desc' })
            .select('-password')
            .select('-otp')
            .select('-fcm-token');
        const documentCount = await Tasker.countDocuments(filter);

        const response = {
            data: taskers,
            meta_data: {
                total_records: documentCount,
                page,
                limit,
                total_page: Math.ceil(documentCount / Number(limit))
            }
        };

        return response;
    }

    /**
     * Function to get tasker data by token
     *
     * @param {*} user
     * @return
     */
    async getMe(user: any) {
        if (user.type !== 'Tasker') throw new HttpException(401, UNAUTHORIZED);

        const me = await Tasker.findById(user._id).select('-password');
        if (!me) throw new HttpException(404, TASKER_NOT_FOUND);

        return me;
    }

    /**
     * Function get id of tasker data
     *
     * @param {*} id
     * @param {*} tasker
     * @param {*} user
     * @return
     */
    async getTaskerById(id: string, user: any) {
        const tasker = await Tasker.findById(id).select('-password').select('-fcm_token');
        if (!tasker) throw new HttpException(404, TASKER_NOT_FOUND);

        return tasker;
    }

    /**
     * Function update tasker data
     *
     * @param {*} taskerData
     * @param {*} id
     * @param {*} user
     * @return1
     */
    async updateTasker(id: string, taskerData: any, user: any) {
        if (user.type == 'User') throw new HttpException(401, UNAUTHORIZED);
        await this.chekingDataBeforeUpdate(id, taskerData);

        const tasker = await Tasker.findByIdAndUpdate(id, taskerData, { new: true }).select('-password');
        if (!tasker) throw new HttpException(404, TASKER_NOT_FOUND);
        tasker.updated_time = Date.now();

        return tasker;
    }

    /**
     * Function delete tasker data
     *
     * @param {*} id
     * @param {*} user
     * @return
     */
    async deleteTasker(id: string) {
        const tasker = await Tasker.findByIdAndDelete(id);
        if (!tasker) throw new HttpException(400, TASKER_NOT_FOUND);

        return tasker;
    }

    /**
     * Function changePassword in profile tasker
     * @param {*} id
     * @param {*} password
     * @param {*} new_password
     * @return
     */
    async changePassword(id: any, password: string, new_password: string) {
        //check id user if not found id user
        const tasker = await Tasker.findById(id);

        //check compare password old if password old wrong => error
        const password_old = await tasker.comparePassword(password);
        if (!password_old) throw new HttpException(400, INVALID_PASSWORD);

        //create password new
        tasker.password = new_password;
        //check password old and new password if new == old then error
        if (password === new_password) throw new HttpException(400, SAME_THE_CHANGE_PASSWORD);

        await tasker.hashPassword();
        await tasker.save();

        return tasker;
    }

    /**
     * Function upload file image avatar
     * @param id
     * @param taskerData
     * @returns
     */
    async uploadFile(id: any, taskerData: any) {
        //config url link file then send url to cloud google storage data img and save url avatar in database
        const fileAvatar = await upload(taskerData);
        if (!fileAvatar) throw new HttpException(400, { error_code: '400', error_message: '' });

        taskerData.avatar = fileAvatar;

        const tasker = await Tasker.findByIdAndUpdate(id, taskerData, { new: true }).select('-password');
        if (!tasker) throw new HttpException(400, TASKER_NOT_FOUND);

        tasker.updated_time = Date.now();

        return tasker;
    }

    /**
     * Function upload files household
     * @param {*} id
     * @param {*} list_files_household
     */
    async uploadFilesHousehold(id: string, list_files_household: any) {
        //config url link file then send url to cloud google storage data img and save url avatar in database
        const listFile = await uploadManyFiles(list_files_household);
        if (!listFile) throw new HttpException(400, { error_code: '400', error_message: '' });

        const tasker = await Tasker.findByIdAndUpdate(
            id,
            { $addToSet: { list_pictures_household: listFile } },
            { new: true }
        );
        if (!tasker) throw new HttpException(400, TASKER_NOT_FOUND);
        tasker.updated_time = Date.now();

        await tasker.save();

        return tasker;
    }

    /**
     * Function upload files household
     * @param {*} id
     * @param {*} list_files_crime
     */
    async uploadFilesCrimeRecored(id: string, list_files_crime: any) {
        //config url link file then send url to cloud google storage data img and save url avatar in database
        const listFile = await uploadManyFiles(list_files_crime);
        if (!listFile) throw new HttpException(400, { error_code: '400', error_message: '' });

        const tasker = await Tasker.findByIdAndUpdate(
            id,
            { $addToSet: { list_pictures_crimerecords: listFile } },
            { new: true }
        );
        if (!tasker) throw new HttpException(400, TASKER_NOT_FOUND);
        tasker.updated_time = Date.now();

        await tasker.save();

        return tasker;
    }

    /**
     * Function delete file upload list_pictures_household list image
     * @param id
     * @returns
     */
    async deleteFileHouseHold(id: any, list_pictures_household: string) {
        const filedelete: any = await Tasker.findByIdAndUpdate(
            id,
            {
                $pull: {
                    list_pictures_household: list_pictures_household
                }
            },
            { new: true }
        );
        if (!filedelete) throw new HttpException(404, TASKER_NOT_FOUND);
        if (!list_pictures_household) throw new HttpException(404, TASKER_NOT_FOUND);

        //delete file url list_pictures_household on google cloud and replace file data url
        await bucket
            .file(list_pictures_household.replace(/.*\//, ''))
            .delete()
            .catch((err) => {
                console.log(err);
            });

        return filedelete;
    }

    /**
     * Function delete file upload list_pictures_crimerecords list image
     * @param id
     * @returns
     */
    async deleteFileCrimeRecords(id: any, list_pictures_crimerecords: string) {
        const filedelete: any = await Tasker.findByIdAndUpdate(
            id,
            {
                $pull: {
                    list_pictures_crimerecords: list_pictures_crimerecords
                }
            },
            { new: true }
        );
        if (!filedelete) throw new HttpException(404, TASKER_NOT_FOUND);
        if (!list_pictures_crimerecords) throw new HttpException(404, TASKER_NOT_FOUND);

        //delete file url list_pictures_crimerecords on google cloud and replace file data url
        await bucket
            .file(list_pictures_crimerecords.replace(/.*\//, ''))
            .delete()
            .catch((err) => {
                console.log(err);
            });

        return filedelete;
    }
}
