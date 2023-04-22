import { User } from '../models/user.model';
import { Tasker } from '../models/tasker.model';
import { HttpException } from '../common';
import * as cacheManager from 'cache-manager';
import { makeToken } from '../lib/helper';
import { sendMail } from '../lib/sendMail';
import { join } from 'path';
import * as ejs from 'ejs';
import { pick } from 'lodash';
import {
    TASKER_NOT_FOUND,
    USER_NOT_FOUND,
    EMAIL_ALREADY_EXIST,
    INVALID_TOKEN,
    INVALID_VERIFICATION_CODE,
    INVALID_VERIFICATION_OTP_EXPRIED
} from '../common/constants/err.constants';

export class RegisterService {
    private static instance: RegisterService;
    private memoryCache: cacheManager.Cache = cacheManager.caching({
        store: 'memory',
        max: 100,
        ttl: 600 /*seconds*/
    });

    static getInstance(): RegisterService {
        if (!RegisterService.instance) {
            RegisterService.instance = new RegisterService();
        }
        return RegisterService.instance;
    }

    /**
     * Function to save forgot token to cache memory with user id
     * @param userId
     * @param token
     */
    async saveForgotPasswordToken(userId: string, token: string) {
        const ttl = 600;

        await this.memoryCache.set(`forgotPass#${userId}`, token, { ttl: ttl });
        const tokens = await this.memoryCache.get(`forgotPass#${userId}`);
        // console.log(this.memoryCache);
        console.log(tokens);
    }

    /**
     * Function forgot password User send otp email to user id
     * @param email
     * @returns
     */
    async checkEmailRegister(email: string) {
        let user = await User.findOne({ email });
        if (user) throw new HttpException(400, EMAIL_ALREADY_EXIST);
        //save email in database
        user = await User.create({ email, password: 'caicui@123', createdAt: Date.now() + 30 * 60 * 1000 });
        // Generate forgot password token
        const token = makeToken(4);
        this.saveForgotPasswordToken(user._id, token);

        user.otp = token;
        user.is_active = true;

        await user.save();

        // //Generate html email template body
        const html = await ejs.renderFile(join('src', '/views/email', 'forgotPassword.ejs'), { token });

        // send the generated code to the user's email
        try {
            sendMail(email, html);
        } catch (error) {
            console.log(error.message);
        }

        return { status: 'success' };
    }

    /**
     * Function check otp code when send email
     * @param otp
     * @returns
     */
    async checkOtpUser(otp: string) {
        let user = await User.findOne({ otp });
        if (!user) throw new HttpException(400, INVALID_VERIFICATION_CODE);
        // Get token from cache memory with user id
        const fgToken = await this.memoryCache.get(`forgotPass#${user._id}`);
        //check otp code
        if (!fgToken || fgToken !== otp) throw new HttpException(400, INVALID_VERIFICATION_OTP_EXPRIED);
        // this.memoryCache.del(`forgotPass#${user._id}`);

        await user.save();

        return { status: 'success', user: pick(user, ['_id']) };
    }

    /**
     * Check the phone number and email has been created or not, if it has already been created, it will not allow to create
     * Check password is not allowed to contain special characters
     * Returns true if valid, otherwise throws an httpexception
     *
     * @param {*} userData
     */
    async chekingDataBeforeCreateUser(userData: any) {
        const existsUser = await User.findOne({ email: userData.email });
        if (existsUser) throw new HttpException(400, EMAIL_ALREADY_EXIST);

        // password must not contain special characters
        const format = /[^a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+/;
        if (format.test(userData.password))
            throw new HttpException(400, {
                error_code: '400',
                error_message: 'Password must not contain special characters'
            });

        return true;
    }

    /**
     * Function resgister user data
     * @param {*} userData
     */
    async registerUser(id: any, userData: any) {
        await this.chekingDataBeforeCreateUser(userData);

        let fields = userData;
        let user = await User.findById(id);
        if (!user) throw new HttpException(404, USER_NOT_FOUND);

        fields.otp = '';
        fields.createdAt = null;
        fields.is_active = false;

        Object.assign(user, fields);

        this.memoryCache.del(`forgotPass#${user._id}`);

        await user.hashPassword();
        await user.save();

        return user;
    }

    /**
     * Function forgot password User send otp email to user id
     * @param email
     * @returns
     */
    async checkEmailRegisterTasker(email: string) {
        let tasker = await Tasker.findOne({ email });
        if (tasker) throw new HttpException(400, EMAIL_ALREADY_EXIST);
        tasker = await Tasker.create({ email, password: 'caicui@123', createdAt: Date.now() + 30 * 60 * 1000 });
        // Generate forgot password token
        const token = makeToken(4);
        this.saveForgotPasswordToken(tasker._id, token);

        tasker.otp = token;
        tasker.is_active = true;

        // //Generate html email template body
        const html = await ejs.renderFile(join('src', '/views/email', 'forgotPassword.ejs'), { token });

        // send the generated code to the user's email
        try {
            sendMail(email, html);
        } catch (error) {
            console.log(error.message);
        }

        await tasker.save();

        return { status: 'success' };
    }

    /**
     * Function check otp code when send email
     * @param otp
     * @returns
     */
    async checkOtpTasker(otp: string) {
        let tasker = await Tasker.findOne({ otp });
        if (!tasker) throw new HttpException(400, INVALID_VERIFICATION_CODE);
        // Get token from cache memory with user id
        const fgToken = await this.memoryCache.get(`forgotPass#${tasker._id}`);
        //check otp code
        if (!fgToken || fgToken !== otp) throw new HttpException(400, INVALID_VERIFICATION_OTP_EXPRIED);

        await tasker.save();

        return { status: 'success', tasker: pick(tasker, ['_id']) };
    }

    /**
     * Check the phone number and email has been created or not, if it has already been created, it will not allow to create
     * Check password is not allowed to contain special characters
     * Returns true if valid, otherwise throws an httpexception
     *
     * @param {*} taskerData
     */
    async chekingDataBeforeCreateTasker(taskerData: any) {
        const existsUser = await Tasker.findOne({ email: taskerData.email });
        if (existsUser) throw new HttpException(400, EMAIL_ALREADY_EXIST);

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
     * Function resgister tasker data
     * @param {*} taskerData
     * @param {*} id
     */

    async registerTasker(id: string, taskerData: any) {
        await this.chekingDataBeforeCreateTasker(taskerData);

        let fields = taskerData;
        let tasker = await Tasker.findById(id);
        if (!tasker) throw new HttpException(404, TASKER_NOT_FOUND);

        fields.otp = '';
        fields.createdAt = null;
        fields.is_active = false;
        Object.assign(tasker, fields);

        this.memoryCache.del(`forgotPass#${tasker._id}`);

        await tasker.hashPassword();
        await tasker.save();

        return tasker;
    }
}
