import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactService {
  constructor(private configService: ConfigService) {}

  async sendEmail(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
    to: string;
  }) {
    // For now, we'll just log the email and return success
    // In production, you can integrate with an email service like SendGrid, AWS SES, or Nodemailer
    
    const emailContent = `
New Contact Form Submission from Apna Safar

Name: ${contactData.name}
Email: ${contactData.email}
Subject: ${contactData.subject}

Message:
${contactData.message}

---
This email was sent from the Apna Safar contact form.
    `.trim();

    console.log('=== CONTACT FORM SUBMISSION ===');
    console.log(`To: ${contactData.to}`);
    console.log(`From: ${contactData.email}`);
    console.log(`Subject: ${contactData.subject}`);
    console.log(`Content:\n${emailContent}`);
    console.log('==============================');

    // TODO: Integrate with actual email service
    // Example with Nodemailer:
    // await this.nodemailerService.sendMail({
    //   to: contactData.to,
    //   from: contactData.email,
    //   subject: `[Apna Safar Contact] ${contactData.subject}`,
    //   text: emailContent,
    // });

    return {
      success: true,
      message: 'Your message has been received. We will get back to you soon!',
    };
  }
}

