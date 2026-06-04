import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrevoClient } from '@getbrevo/brevo';

@Injectable()
export class MailService {
  private client: BrevoClient;
  private fromEmail: string;
  private fromName: string;

  constructor(private config: ConfigService) {
    this.client = new BrevoClient({
      apiKey: this.config.getOrThrow<string>('BREVO_API_KEY'),
    });
    this.fromEmail = this.config.get<string>('MAIL_FROM', 'noreply@gymnotes.app');
    this.fromName = this.config.get<string>('MAIL_FROM_NAME', 'GymNotes');
  }

  async sendVerificationEmail(email: string, name: string, token: string, baseUrl: string) {
    const url = `${baseUrl}/auth/verify-email?token=${token}`;

    console.log('[MAIL] Iniciando envio via Brevo');
    console.log('[MAIL] Destinatário:', email);

    try {
      const result = await this.client.transactionalEmails.sendTransacEmail({
        sender: { email: this.fromEmail, name: this.fromName },
        to: [{ email, name }],
        subject: 'Confirme seu email — GymNotes',
        htmlContent: `
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

      console.log('[MAIL] Email enviado com sucesso. ID:', result.messageId);
    } catch (error) {
      console.error('[MAIL] Erro ao enviar email:', error);
      throw error;
    }
  }
}