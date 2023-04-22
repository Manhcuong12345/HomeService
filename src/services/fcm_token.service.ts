import { User } from '../models/user.model';
import { Tasker } from '../models/tasker.model';
import { USER_NOT_FOUND } from '../common/constants/err.constants';
import { HttpException } from '../common';

export class FcmtokenService {
    private static instance: FcmtokenService;

    static getInstance(): FcmtokenService {
        if (!FcmtokenService.instance) {
            FcmtokenService.instance = new FcmtokenService();
        }
        return FcmtokenService.instance;
    }

    /**
     * Function update many fcm_token to user when login app
     * @param {*} filter
     * @param {*} data
     */
    async updateManyFcmUser(filter: any, data: any) {
        const fcm_user = await User.updateMany(data);
        return fcm_user;
    }

    /**
     * Function update many fcm_token to user when login app
     * @param {*} filter
     * @param {*} data
     */
    async updateManyFcmTasker(filter: any, data: any) {
        const fcm_tasker = await Tasker.updateMany(data);
        return fcm_tasker;
    }

    /**
     * Function create fcm token to user
     * @param {*} id
     * @param {*} fcm_token
     * @returns
     */
    async createFcmTokenUser(id: string, fcm_token: string) {
        // If this token has been assigned to a user, this token would be deleted from that user
        await this.updateManyFcmUser({}, { $pull: { fcm_token: fcm_token } });

        // const user = await User.findById(id);
        // // If the user already has this token, it will not be added
        // // This will save storage space on the database
        // if (!user.fcm_token.includes(fcm_token)) {
        //     user.fcm_token.push(fcm_token);
        //     user.save();
        // }
        const user = await User.findByIdAndUpdate(id, { $push: { fcm_token: fcm_token } }, { new: true });
        if (!user) throw new HttpException(404, USER_NOT_FOUND);

        return user;
    }

    /**
     * Function remove fcm_token to user
     * @param id
     * @param fcm_token
     * @returns
     */
    async removeFcmTokenUser(id: string, fcm_token: any) {
        const user: any = await User.findByIdAndUpdate(id, { $pull: { fcm_token: fcm_token } }, { new: true });

        return user;
    }

    /**
     * Function create fcm token to tasker
     * @param {*} id
     * @param {*} fcm_token
     * @returns
     */
    async createFcmTokenTasker(id: string, fcm_token: string) {
        await this.updateManyFcmTasker({}, { $pull: { fcm_token } });

        // const tasker = await Tasker.findById(id);
        // // If the user already has this token, it will not be added
        // // This will save storage space on the database
        // if (!tasker.fcm_token.includes(fcm_token)) {
        //     tasker.fcm_token.push(fcm_token);
        //     tasker.save();
        // }

        const tasker = await Tasker.findByIdAndUpdate(id, { $push: { fcm_token: fcm_token } }, { new: true });
        if (!tasker) throw new HttpException(404, USER_NOT_FOUND);

        return tasker;
    }

    /**
     * Function create fcm token to tasker
     * @param id
     * @param fcm_token
     * @returns
     */
    async removeFcmTokenTasker(id: string, fcm_token: string) {
        const tasker: any = await Tasker.findByIdAndUpdate(id, { $pull: { fcm_token: fcm_token } }, { new: true });
        return tasker;
    }
}
