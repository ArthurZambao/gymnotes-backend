import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.config.getOrThrow<string>('MAIL_USER'),
        pass: this.config.getOrThrow<string>('MAIL_PASS'),
      },
    });
    this.fromAddress = this.config.get<string>('MAIL_FROM', 'GymNotes <onboarding@resend.dev>');
  }

  async sendVerificationEmail(email: string, name: string, token: string, baseUrl: string) {
    const url = `${baseUrl}/auth/verify-email?token=${token}`;

    console.log('[MAIL] Iniciando envio via Nodemailer');
    console.log('[MAIL] Destinatário:', email);

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
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

      console.log('[MAIL] Email enviado com sucesso. ID:', info.messageId);
    } catch (error) {
      console.error('[MAIL] Erro ao enviar email:', error);
      throw error;
    }
  }
}