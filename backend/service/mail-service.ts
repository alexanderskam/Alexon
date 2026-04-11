import { Resend } from 'resend';
import ApiError from '../exceptions/api-errors.js';

class MailService {
    private resend: Resend;

    constructor() {
        if (!process.env.RESEND_API_KEY) {
            throw ApiError.BadRequest('No RESEND_API_KEY');
        }

        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async sendActivationMail(email: string, activationLink: string) {
        try {
            await this.resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'Активация аккаунта',
                html: `
                    <div>
                        <h1>Активация аккаунта</h1>
                        <p>Перейдите по ссылке:</p>
                        <a href="${activationLink}">${activationLink}</a>
                    </div>
                `,
            });
        } catch (e) {
            console.log(e);
            throw ApiError.BadRequest('Ошибка отправки письма');
        }
    }
}

export default new MailService();
