import nodemailer from 'nodemailer';
import { config } from '../config/config';

/**
 * Function send Mail to user
 * @param {} email
 * @param {} html
 */
export async function sendMail(email: string, html: string) {
    try {
        const toEmails = email;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.get('mailAddress'), // generated ethereal user
                pass: config.get('mailPassword') // generated ethereal password
            }
        });

        const info = await transporter.sendMail({
            from: '"Công Ty TNHH JoyTechs"', // sender address
            to: toEmails, // list of receivers
            subject: 'Home-Service✔', // Subject line
            text: 'Forgot Password', // plain text body
            html: html
        });

        console.log('Message sent: %s', info.messageId);
    } catch (err) {
        console.log(err.message);
    }
}
