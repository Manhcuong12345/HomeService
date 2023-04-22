import axios from 'axios';
import { config } from '../config/config';

export class FirebaseService {
    //function config data to headers when send noti
    static async sendRequest(url: string, data: any) {
        const response = await axios.request({
            method: 'POST',
            url,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'key=' + config.get('firebaseToken')
            },
            data
        });
        return response.data;
    }

    //function send noti when have fcm token
    static async sendNotifications(tokens: string[], data: any) {
        try {
            const result = await this.sendRequest(config.get('firebaseURL'), {
                registration_ids: tokens,
                content_available: true,
                notification: data,
                priority: 'high',
                data: {
                    ...data,
                    url: 'https://www.google.com/',
                    img: 'https://media3.scdn.vn/img4/2020/04_16/1vz9YFtpDPe3LYkiryuA_simg_de2fe0_500x500_maxb.jpg'
                }
            });
            console.log(result);
        } catch (error) {
            console.log(error.message);
        }
    }

    //Function reload notification when send noti to fcm
    static async sendBackgroundNotifications(tokens: string[], data: any) {
        try {
            const result = await this.sendRequest(config.get('firebaseURL'), {
                registration_ids: tokens,
                content_available: true,
                'apns-priority': 5,
                notification: data,
                data: {
                    ...data,
                    url: 'https://www.google.com/',
                    img: 'https://media3.scdn.vn/img4/2020/04_16/1vz9YFtpDPe3LYkiryuA_simg_de2fe0_500x500_maxb.jpg'
                }
            });
            console.log(result);
        } catch (error) {
            console.log(error.message);
        }
    }
}
