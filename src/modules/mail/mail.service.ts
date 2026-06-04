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
        htmlContent: this.buildVerificationEmailHtml(name, url),
      });

      console.log('[MAIL] Email enviado com sucesso. ID:', result.messageId);
    } catch (error) {
      console.error('[MAIL] Erro ao enviar email:', error);
      throw error;
    }
  }

  private buildVerificationEmailHtml(name: string, url: string): string {
    const firstName = name.split(' ')[0];
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu email — GymNotes</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden;">

          <!-- Header com Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #18181b 0%, #1a2e1f 100%); padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #27272a;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <div style="width: 36px; height: 36px; background-color: #09090b; border: 1px solid #27272a; border-radius: 10px; text-align: center; line-height: 36px; font-size: 18px;">
                      🏋️
                    </div>
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.05em; color: #f4f4f5;">Gym</span><span style="font-size: 26px; font-weight: 800; letter-spacing: -0.05em; color: #10b981;">Notes</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corpo Principal -->
          <tr>
            <td style="padding: 40px 40px 16px;">
              <!-- Saudação -->
              <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f4f4f5; letter-spacing: -0.02em;">
                Fala, <span style="color: #10b981;">${firstName}</span>! 👋
              </h1>
              <p style="margin: 0 0 28px; font-size: 15px; color: #a1a1aa; line-height: 1.6;">
                Estamos quase lá. Confirme seu email para ativar sua conta e começar a registrar seus treinos.
              </p>

              <!-- Card de destaque -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px 24px;">
                    <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">
                      ⏰ Atenção
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #a1a1aa; line-height: 1.5;">
                      Este link expira em <strong style="color: #f4f4f5;">24 horas</strong>. Após esse prazo, será necessário solicitar um novo email de verificação.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Botão CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <a href="${url}" target="_blank" style="
                      display: inline-block;
                      background-color: #10b981;
                      color: #09090b;
                      font-size: 15px;
                      font-weight: 800;
                      text-decoration: none;
                      padding: 14px 36px;
                      border-radius: 12px;
                      letter-spacing: -0.01em;
                      box-shadow: 0 0 20px rgba(16, 185, 129, 0.25);
                    ">Verificar meu email ✓</a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin: 0 0 8px; font-size: 12px; color: #52525b;">
                Se o botão não funcionar, copie e cole este link no navegador:
              </p>
              <p style="margin: 0; font-size: 11px; word-break: break-all; color: #10b981; line-height: 1.5;">
                ${url}
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #27272a;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #52525b; line-height: 1.5;">
                Se não foi você quem criou esta conta, ignore este email com segurança.
              </p>
              <p style="margin: 0; font-size: 11px; color: #3f3f46;">
                © ${new Date().getFullYear()} GymNotes — Transforme seu corpo. Evolua sua mente.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}