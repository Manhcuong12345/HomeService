import dotenv from 'dotenv';

export class Config {
    private static instance: Config;
    private readonly envConfig: { [key: string]: any } = null;

    constructor() {
        dotenv.config();
        this.envConfig = {
            port: process.env.PORT,
            connectionString: process.env.CONNECTION_STRING,
            connectionUrlRedis: process.env.CONNECTION_URL_REDIS,
            passwordRedis: process.env.PASSWORD_REDIS,
            DatabaseNameRedis: process.env.DATABASE_NAME_REDIS,
            portRedis: process.env.PORT_REDIS,
            jwtKey: process.env.JWT_KEY,
            mailAddress: process.env.MAIL_ADDRESS,
            mailPassword: process.env.MAIL_PASSWORD,
            google_Id: process.env.GOOGLE_CLIENT_ID,
            google_Secret: process.env.GOOGLE_CLIENT_SECRET,
            facebookClientId: process.env.FACEBOOK_CLIENT_ID,
            facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            firebaseURL: process.env.FIREBASE_URL,
            firebaseToken: process.env.FIREBASE_TOKEN,
            privateKey: process.env.GC_PRIVATE_KEY,
            clientEmail: process.env.GC_CLIENT_EMAIL,
            projectId: process.env.GC_PROJECT,
            bucket: process.env.GC_BUCKET,
            uploadType: process.env.UPLOAD_TYPE,
            upload: process.env.UPLOAD_FILE,
            vnp_TmnCode: process.env.VNP_TMNCODE,
            vnp_HashSecret: process.env.VNP_HASHSECRET,
            vnp_Url: process.env.VNP_URL,
            vnp_ReturnUrl: process.env.VNP_RETURNURL
        };
    }

    static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    get(key: string): any {
        return this.envConfig[key];
    }
}

export const config: Config = Config.getInstance();
