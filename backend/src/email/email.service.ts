import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    // Initialize email transporter
    // For production, use SMTP or email service (SendGrid, AWS SES, etc.)
    // For development, you can use Gmail SMTP or a service like Mailtrap
    const emailHost = this.configService.get<string>('EMAIL_HOST') || 'smtp.gmail.com';
    const emailPort = this.configService.get<number>('EMAIL_PORT') || 587;
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');

    if (emailUser && emailPassword) {
      this.transporter = createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });
    } else {
      // Fallback: log emails to console in development
      console.warn('⚠️ Email service not configured. Emails will be logged to console.');
      this.transporter = createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    }
  }

  /**
   * Send email confirmation with HTML template
   */
  async sendConfirmationEmail(email: string, name: string, confirmationLink: string) {
    const html = this.getConfirmationEmailTemplate(name, confirmationLink);

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM') || 'noreply@apnasafar.com',
      to: email,
      subject: 'Welcome to Apna Safar - Confirm Your Email',
      html,
    };

    try {
      if (this.configService.get<string>('EMAIL_USER')) {
        await this.transporter.sendMail(mailOptions);
        console.log(`✅ Confirmation email sent to ${email}`);
      } else {
        // Development: log email
        console.log('=== EMAIL (Development Mode) ===');
        console.log('To:', email);
        console.log('Subject:', mailOptions.subject);
        console.log('HTML:', html);
        console.log('================================');
      }
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, name: string, resetLink: string) {
    const html = this.getPasswordResetEmailTemplate(name, resetLink);

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM') || 'noreply@apnasafar.com',
      to: email,
      subject: 'Apna Safar - Reset Your Password',
      html,
    };

    try {
      if (this.configService.get<string>('EMAIL_USER')) {
        await this.transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}`);
      } else {
        // Development: log email
        console.log('=== EMAIL (Development Mode) ===');
        console.log('To:', email);
        console.log('Subject:', mailOptions.subject);
        console.log('HTML:', html);
        console.log('================================');
      }
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  /**
   * HTML template for email confirmation
   */
  private getConfirmationEmailTemplate(name: string, confirmationLink: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email - Apna Safar</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Apna Safar</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Smart Public Transport Navigation for Pakistan</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px;">Welcome, ${name || 'there'}!</h2>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Thank you for signing up for Apna Safar! We're excited to help you navigate Pakistan's public transport system with ease.
              </p>
              <p style="margin: 0 0 30px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Please confirm your email address by clicking the button below to complete your registration:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${confirmationLink}" style="display: inline-block; padding: 14px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Confirm Email Address</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${confirmationLink}" style="color: #16a34a; word-break: break-all;">${confirmationLink}</a>
              </p>
              
              <p style="margin: 30px 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                This link will expire in 24 hours for security reasons.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 15px; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                <strong>Need help?</strong><br>
                Contact us at <a href="mailto:synkspace.io@gmail.com" style="color: #16a34a;">synkspace.io@gmail.com</a><br>
                Call us: <a href="https://wa.me/923143796943" style="color: #16a34a;">+92 314 3796943</a>
              </p>
              <p style="margin: 15px 0 0; color: #6a6a6a; font-size: 12px; line-height: 1.6;">
                This email was sent by <strong>Apna Safar</strong>, powered by <strong style="color: #16a34a;">SynkSpace</strong>.<br>
                Visit us at <a href="https://synkspace.io" style="color: #16a34a;">synkspace.io</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * HTML template for password reset
   */
  private getPasswordResetEmailTemplate(name: string, resetLink: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Apna Safar</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Apna Safar</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Smart Public Transport Navigation for Pakistan</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px;">Reset Your Password</h2>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hello ${name || 'there'},
              </p>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your Apna Safar account. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #16a34a; word-break: break-all;">${resetLink}</a>
              </p>
              
              <p style="margin: 30px 0 0; color: #dc2626; font-size: 14px; line-height: 1.6;">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged. This link will expire in 1 hour.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 15px; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                <strong>Need help?</strong><br>
                Contact us at <a href="mailto:synkspace.io@gmail.com" style="color: #16a34a;">synkspace.io@gmail.com</a><br>
                Call us: <a href="https://wa.me/923143796943" style="color: #16a34a;">+92 314 3796943</a>
              </p>
              <p style="margin: 15px 0 0; color: #6a6a6a; font-size: 12px; line-height: 1.6;">
                This email was sent by <strong>Apna Safar</strong>, powered by <strong style="color: #16a34a;">SynkSpace</strong>.<br>
                Visit us at <a href="https://synkspace.io" style="color: #16a34a;">synkspace.io</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}

