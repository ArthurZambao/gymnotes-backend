import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailer: MailerService) { }

  async sendVerificationEmail(email: string, name: string, token: string, baseUrl: string) {
    const url = `${baseUrl}/auth/verify-email?token=${token}`;

    await this.mailer.sendMail({
      to: email,
      subject: 'Confirme seu email — GymNotes',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Olá, ${name}! 👋</h2>
          <p>Confirme seu email clicando no botão abaixo. O link expira em <strong>24 horas</strong>.</p>
          <a href="${url}" target="_self" style="
            display: inline-block; padding: 12px 24px;
            background: #6366f1; color: white;
            border-radius: 8px; text-decoration: none; font-weight: bold;
          ">Verificar email</a>
          <p style="color: #888; font-size: 12px; margin-top: 24px;">
            Se não foi você, ignore este email.
          </p>
        </div>
      `,
    });
  }
}