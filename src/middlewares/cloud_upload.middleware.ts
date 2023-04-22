import multer, { memoryStorage } from 'multer';
import { config } from '../config/config';
import { Storage } from '@google-cloud/storage';
import { HttpException } from '../common';

const math = [
    'jpg',
    'gif',
    'jpeg',
    'bmp',
    'tif',
    'tiff',
    'jfif',
    'png',
    'xps',
    'wmp',
    'ico',
    'mp4',
    'mp3',
    'mkv',
    'avi',
    'flv',
    'mpeg',
    'mov'
];

//Function config link to cloud google storage
const storage = new Storage({
    projectId: config.get('projectId'),
    credentials: {
        client_email: config.get('clientEmail'),
        private_key: config.get('privateKey')
    }
});

const bucket = storage.bucket(config.get('bucket'));

//Function validateFile .file
let validateFile = (file: any) => {
    if (math.indexOf(file.originalname.substring(file.originalname.lastIndexOf('.') + 1)) === -1) {
        let errorMess = `The file ${file.originalname} is invalid. Only allowed to upload jpg,gif,jpeg,bmp,tif,tiff,jfif,png,xps,wmp,ico,mp4,mp3,mkv,avi,flv,mpeg,mov.`;
        return errorMess;
    }
};

const uploadFile = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

//Function upload file to google cloud storage
const upload: any = async (file: any) => {
    if (validateFile(file)) throw new HttpException(400, { error_code: '400', error_message: validateFile(file) });
    const { originalname, buffer } = file;
    const blob = bucket.file(originalname.replace(/ /g, '_'));
    const blobStream = await blob.createWriteStream({ resumable: false });
    return new Promise((resolve, reject) => {
        blobStream.on('error', async (err) => resolve({ error_code: '400', error_message: 'Upload Error' }));
        blobStream
            .on('finish', async () => {
                const publicUrl = encodeURI(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
                resolve(publicUrl);
            })
            .on('error', () => {
                reject(`Unable to upload image, something went wrong`);
            })
            .end(buffer);
        // blobStream.end(file.buffer);
    });
};

//Function upload files to google storage cloud
const uploadManyFiles: any = async (files: any) => {
    return Promise.all(
        files.map((file: any) => {
            // let newFileName = Date.now() + '-' + file.originalname;
            // let blob = bucket.file(newFileName);
            // if (validateFile(file))
            //     throw new HttpException(400, { error_code: '400', error_message: validateFile(file) });
            const { originalname, buffer } = file;
            const blob = bucket.file(originalname.replace(/ /g, '_'));
            let blobStream = blob.createWriteStream();
            const publicUrl = encodeURI(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
            return new Promise((resolve, reject) => {
                blobStream.on('error', async (err) => resolve({ error_code: '01', error_message: 'Upload Error' }));
                blobStream
                    .on('finish', async () => {
                        resolve(publicUrl);
                    })
                    // blobStream.end(file.buffer);
                    .end(buffer);
            });
        })
    );
};

export { upload };
export { uploadManyFiles };
export { validateFile };
export { uploadFile };
export { bucket };
export { storage };
