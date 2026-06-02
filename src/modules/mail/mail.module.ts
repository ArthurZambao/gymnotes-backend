import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow<string>('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT', 587),
          family: 4,
          auth: {
            user: config.getOrThrow<string>('MAIL_USER'),
            pass: config.getOrThrow<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"GymNotes" <${config.getOrThrow<string>('MAIL_FROM')}>`,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }