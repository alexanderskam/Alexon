import nodemailer, { type Transporter } from 'nodemailer';
import ApiError from '../exceptions/api-errors.js';

class MailService {
    transporter: Transporter;
    constructor() {
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        console.log(host, port, user, pass);
        if (host && port && user && pass) {
            this.transporter = nodemailer.createTransport({
                host: host,
                port: Number(port),
                secure: Number(port) === 465,
                auth: {
                    user: user,
                    pass: pass,
                },
            });
        } else throw ApiError.BadRequest('Проблемы с SMTP конфигурацией');
    }
    async sendActivationMail(email: string, activationLink: string) {
        const user = process.env.SMTP_USER;
        try {
            await this.transporter.sendMail({
                from: user,
                to: email,
                subject: 'Активация аккаунта на ' + process.env.API_URL,
                text: '',
                html: `<div>
                <h1>Для активации перейдите по ссылке</h1>
                <a href="${activationLink}">${activationLink}</a>
            </div>`,
            });
        } catch {
            throw ApiError.BadRequest('Ошибка отправки письма');
        }
    }
}

export default new MailService();
