import { User } from '../models/user.model';
import { Tasker } from '../models/tasker.model';
import { Admin } from '../models/admin.model';
import * as ejs from 'ejs';
import * as cacheManager from 'cache-manager';
import { sendMail } from '../lib/sendMail';
import { HttpException } from '../common';
import { join } from 'path';
import { pick } from 'lodash';
import { makeToken } from '../lib/helper';
import {
    UNAUTHORIZED,
    TASKER_NOT_FOUND,
    USER_NOT_FOUND,
    EMAIL_ALREADY_EXIST,
    ADMIN_NOT_FOUND,
    INVALID_VERIFICATION_CODE,
    INVALID_VERIFICATION_OTP_EXPRIED,
    EMAIL_IS_NOT_EXIST
} from '../common/constants/err.constants';

export class ForgotPasswordService {
    private static instance: ForgotPasswordService;
    private memoryCache: cacheManager.Cache = cacheManager.caching({
        store: 'memory',
        max: 100,
        ttl: 300 /*seconds*/
    });

    static getInstance(): ForgotPasswordService {
        if (!ForgotPasswordService.instance) {
            ForgotPasswordService.instance = new ForgotPasswordService();
        }
        return ForgotPasswordService.instance;
    }

    /**
     * Function to save forgot token to cache memory with user id
     * @param userId
     * @param token
     */
    async saveForgotPasswordToken(userId: string, token: string) {
        const ttl = 300;

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
    async forgotPasswordUser(email: string) {
        const user = await User.findOne({ email });
        if (!user) throw new HttpException(400, EMAIL_IS_NOT_EXIST);

        // Generate forgot password token
        const token = makeToken(4);
        this.saveForgotPasswordToken(user._id, token);
        //get otp == token(saveForgotPasswordToken)
        user.otp = token;
        // //Generate html email template body
        const html = await ejs.renderFile(join('src', '/views/email', 'forgotPassword.ejs'), { token });

        // send the generated code to the user's email
        try {
            sendMail(email, html);
        } catch (error) {
            console.log(error.message);
        }

        await user.save();

        return { status: 'success', user: pick(user, ['_id']) };
    }

    /**
     * Function check email when user spam send email continuous
     * @param {*} email
     */
    async checkEmailForSpam(email: string) {
        const existUser = await User.findOne({ email });
        //check mail error
        if (!existUser) throw new HttpException(404, EMAIL_IS_NOT_EXIST);

        return { status: 'success' };
    }

    /**
     * Function check otp code when send email
     * @param otp
     * @returns
     */
    async checkOtpUser(otp: string) {
        const user = await User.findOne({ otp });
        if (!user) throw new HttpException(400, INVALID_VERIFICATION_CODE);

        // Get token from cache memory with user id
        const fgToken = await this.memoryCache.get(`forgotPass#${user._id}`);
        //check otp code
        if (!fgToken || fgToken !== otp) throw new HttpException(400, INVALID_VERIFICATION_OTP_EXPRIED);

        await user.save();

        return { status: 'success', user: pick(user, ['_id']) };
    }

    /**
     * Function reset password
     * @param id
     * @param password
     * @returns
     */
    async resetPasswordUser(id: string, password: string) {
        let user = await User.findById(id);
        if (!user) throw new HttpException(404, USER_NOT_FOUND);
        //check otp is value
        if (user.otp.length == 0)
            throw new HttpException(400, { error_code: '400', error_message: 'User is not found otp code' });

        user.password = password;
        // If the token is entered successfully, it will be deleted from the cache
        user.otp = '';
        this.memoryCache.del(`forgotPass#${user._id}`);

        await user.hashPassword();
        await user.save();

        return user;
    }

    /**
     * Function forgot password Tasker send otp email to user id
     * @param email
     * @returns
     */
    async forgotPasswordTasker(email: string) {
        const tasker = await Tasker.findOne({ email });
        if (!tasker) throw new HttpException(400, EMAIL_IS_NOT_EXIST);

        // Generate forgot password token
        const token = makeToken(4);

        this.saveForgotPasswordToken(tasker._id, token);
        tasker.otp = token;

        // //Generate html email template body
        const html = await ejs.renderFile(join('src', '/views/email', 'forgotPassword.ejs'), { token });

        // send the generated code to the user's email
        try {
            sendMail(email, html);
        } catch (error) {
            console.log(error.message);
        }

        const response = {
            tasker: pick(tasker, ['_id'])
        };

        await tasker.save();

        return { status: 'success', response };
    }

    /**
     * Function check email when user spam send email continuous
     * @param {*} email
     */
    async checkEmailForSpamTasker(email: string) {
        const existTasker = await Tasker.findOne({ email });
        if (!existTasker) throw new HttpException(404, EMAIL_IS_NOT_EXIST);

        return { status: 'success' };
    }

    /**
     * Function check otp code when send email
     * @param otp
     * @returns
     */
    async checkOtpTasker(otp: string) {
        const tasker = await Tasker.findOne({ otp });
        if (!tasker) throw new HttpException(400, INVALID_VERIFICATION_CODE);

        // Get token from cache memory with user id
        const fgToken = await this.memoryCache.get(`forgotPass#${tasker._id}`);
        //check otp code
        if (!fgToken || fgToken !== otp) throw new HttpException(400, INVALID_VERIFICATION_OTP_EXPRIED);

        await tasker.save();

        return { status: 'success', tasker: pick(tasker, ['_id']) };
    }

    /**
     * Function reset password
     * @param id
     * @param password
     * @returns
     */
    async resetPasswordTasker(id: string, password: string) {
        let tasker = await Tasker.findById(id);
        if (!tasker) throw new HttpException(404, TASKER_NOT_FOUND);
        //check otp is value
        if (tasker.otp.length == 0)
            throw new HttpException(400, { error_code: '400', error_message: 'Tasker is not found otp code' });

        tasker.password = password;
        // If the token is entered successfully, it will be deleted from the cache
        tasker.otp = '';
        this.memoryCache.del(`forgotPass#${tasker._id}`);

        await tasker.hashPassword();
        await tasker.save();

        return tasker;
    }

    /**
     * Function forgot password Tasker send otp email to user id
     * @param email
     * @returns
     */
    async forgotPasswordAdmin(email: string) {
        const admin = await Admin.findOne({ email });
        if (!admin) throw new HttpException(400, EMAIL_IS_NOT_EXIST);

        // Generate forgot password token
        const token = makeToken(4);

        this.saveForgotPasswordToken(admin._id, token);
        admin.otp = token;
   
        // //Generate html email template body
        const html = await ejs.renderFile(join('src', '/views/email', 'forgotPassword.ejs'), { token });

        // send the generated code to the user's email
        try {
            sendMail(email, html);
        } catch (error) {
            console.log(error.message);
        }

        await admin.save();

        return { status: 'success', admin: pick(admin, ['_id']) };
    }

    /**
     * Function check email when user spam send email continuous
     * @param {*} email
     */
    async checkEmailForSpamAdmin(email: string) {
        const existAdmin = await Admin.findOne({ email });
        //check mail error
        if (!existAdmin) throw new HttpException(404, EMAIL_IS_NOT_EXIST);

        return { status: 'success' };
    }

    /**
     * Function check otp code when send email
     * @param otp
     * @returns
     */
    async checkOtpAdmin(otp: string) {
        const admin = await Admin.findOne({ otp });
        if (!admin) throw new HttpException(404, INVALID_VERIFICATION_CODE);

        // Get token from cache memory with user id
        const fgToken = await this.memoryCache.get(`forgotPass#${admin._id}`);
        //check otp code
        if (!fgToken || fgToken !== otp) throw new HttpException(400, INVALID_VERIFICATION_OTP_EXPRIED);

        await admin.save();

        return { status: 'success', admin: pick(admin, ['_id']) };
    }

    /**
     * Function reset password
     * @param id
     * @param password
     * @returns
     */
    async resetPasswordAdmin(id: string, password: string) {
        let admin = await Admin.findById(id);
        if (!admin) throw new HttpException(404, ADMIN_NOT_FOUND);
        //check otp is value
        if (admin.otp.length == 0)
            throw new HttpException(400, { error_code: '400', error_message: 'Admin is not found otp code' });

        admin.password = password;
        // If the token is entered successfully, it will be deleted from the cache
        admin.otp = '';
        this.memoryCache.del(`forgotPass#${admin._id}`);

        await admin.hashPassword();
        await admin.save();

        return admin;
    }
}
