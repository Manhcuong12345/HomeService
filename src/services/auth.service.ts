import { User } from '../models/user.model';
import { Tasker } from '../models/tasker.model';
import { Admin } from '../models/admin.model';
import { Request, Response } from 'express';
import Joi from 'joi';
import axios from 'axios';
import { HttpException } from '../common';
import bcrypt from 'bcrypt';
import { pick } from 'lodash';
import { IFUser } from '../interfaces/user.interface';
import { AUTH_FAIL } from '../common/constants/err.constants';

export class AuthService {
    private static instance: AuthService;

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }
    /**
     * Function to login user
     * @param {*} password
     * @param {*} email
     *
     */

    async login(email: string, password: string, res: Response) {
        const { error } = AuthService.validate({ email, password });
        if (error) throw new HttpException(400, { error_code: '400', error_message: error.details[0].message });

        const user = await User.findOne({ email });
        if (!user) throw new HttpException(400, AUTH_FAIL);

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new HttpException(400, AUTH_FAIL);

        const response = {
            user: pick(user, ['_id', 'name', 'email'])
        };

        const token = user.generateToken();
        res.header('x-auth-token', token).send(response);
    }

    /**
     * Function to login tasker
     * @param {*} password
     * @param {*} email
     *
     */
    async loginTasker(email: string, password: string, res: Response) {
        const { error } = AuthService.validate({ email, password });
        if (error) throw new HttpException(400, { error_code: '400', error_message: error.details[0].message });

        const tasker = await Tasker.findOne({ email });
        if (!tasker) throw new HttpException(400, AUTH_FAIL);

        const isValid = await bcrypt.compare(password, tasker.password);
        if (!isValid) throw new HttpException(400, AUTH_FAIL);

        const response = {
            tasker: pick(tasker, ['_id', 'name', 'email'])
        };

        const token = tasker.generateToken();
        res.header('x-auth-token', token).send(response);
    }

    /**
     * Function to login admin
     * @param {*} password
     * @param {*} email
     *
     */

    async loginAdmin(email: string, password: string, res: Response) {
        const { error } = AuthService.validate({ email, password });
        if (error) throw new HttpException(400, { error_code: '400', error_message: error.details[0].message });

        const admin = await Admin.findOne({ email });
        if (!admin) throw new HttpException(400, AUTH_FAIL);

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) throw new HttpException(400, AUTH_FAIL);

        const response = {
            admin: pick(admin, ['_id', 'name', 'email'])
        };

        const token = admin.generateToken();
        res.header('x-auth-token', token).send(response);
    }

    /**
     * Function to validate login info
     *
     * @param loginData login info
     * @returns
     */
    static validate(loginData: { email: string; password: string }): Joi.ValidationResult {
             const schema = Joi.object().keys({
                 email: Joi.string().email().required(),
                 password: Joi.string().min(6).max(50).required()
             });
        return schema.validate(loginData);
    }

    /**
     * Function login facebook data
     * @param accessToken
     * @param res
     * @returns
     */

    async getUserByFBToken(accessToken: string, res: Response) {
        const PATH = 'https://graph.facebook.com/me';

        // Get user profile by Facebook access token
        const resp = await axios.get(PATH, {
            params: {
                fields: 'id,name,email,picture',
                access_token: accessToken
            }
        });

        const profile = resp.data;

        // Get user by profile have just got
        // If user profile did not exist in database, then it will be created
        const user = await this.getUserByFbProfile(profile);
        const token = user.generateToken();
        const response = {
            user: pick(user, ['_id', 'email', 'name', 'authType', 'avatar'])
        };

        return res.header('x-auth-token', token).send(response);
    }

    /**
     * Get user by facebook profile
     * If user profile did not exist in database, then it will be created
     * @param profile facebook profile
     * @returns
     */
    async getUserByFbProfile(profile: any): Promise<IFUser> {
        const user = await User.findOne({ authFacebookId: profile.id, authType: 'facebook' });

        if (user) return user;
        else {
            //if new account
            const newUser = new User({
                authType: 'facebook',
                authGoogleId: profile.id,
                email: profile.email,
                name: profile.name,
                avatar: profile.data.url
            });
            await newUser.save();

            return newUser;
        }
    }

    /**
     * Function login google user
     * @param accessToken
     * @param res
     * @returns
     */
    async getUserByGGToken(accessToken: string, res: Response) {
        const PATH = 'https://www.googleapis.com/oauth2/v2/userinfo';

        // Get user profile by Google access token
        const resp = await axios.get(PATH, {
            params: {
                field: 'id,name,email,picture',
                access_token: accessToken
            }
        });

        const profile = resp.data;
        console.log(profile);

        // Get user by profile have just got
        // If user profile did not exist in database, then it will be created
        const user = await this.getUserByGGProfile(profile);
        const token = user.generateToken();
        const response = {
            user: pick(user, ['_id', 'email', 'name', 'authType'])
        };

        return res.header('x-auth-token', token).send(response);
    }

    /**
     * Get user by google profile
     * If user profile did not exist in database, then it will be created
     * @param profile google profile
     * @returns
     */
    async getUserByGGProfile(profile: any): Promise<IFUser> {
        const user = await User.findOne({ email: profile.email, authType: 'google' });

        if (user) return user;
        else {
            //if new account
            const newUser = new User({
                authType: 'google',
                authGoogleId: profile.id,
                email: profile.email,
                name: profile.name,
                avatar: profile.picture
            });
            await newUser.save();

            return newUser;
        }
    }
}
