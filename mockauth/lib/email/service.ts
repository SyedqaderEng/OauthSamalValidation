import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<void> {
    if (!process.env.ENABLE_EMAIL_NOTIFICATIONS || process.env.ENABLE_EMAIL_NOTIFICATIONS === 'false') {
      console.log('Email notifications disabled. Would have sent:', options.subject);
      return;
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@mockauth.dev',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      console.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <h1>Welcome to MockAuth!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for signing up for MockAuth. You can now create OAuth and SAML testing environments.</p>
      <p>Get started by creating your first OAuth app or SAML environment!</p>
      <p>Best regards,<br>The MockAuth Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to MockAuth',
      html,
    });
  }

  static async sendExpiryWarningEmail(params: {
    email: string;
    name: string;
    resources: Array<{ type: string; name: string; expiresAt: Date; metadata?: string }>;
    daysUntilExpiry: number;
  }): Promise<void> {
    const attachments = params.resources
      .filter(r => r.metadata)
      .map(r => ({
        filename: `${r.name.replace(/[^a-z0-9]/gi, '_')}_metadata.xml`,
        content: r.metadata!,
        contentType: 'application/xml',
      }));

    const resourceList = params.resources
      .map(r => `- ${r.name} (${r.type}) - expires ${r.expiresAt.toLocaleDateString()}`)
      .join('\n');

    const html = `
      <h1>Your MockAuth Resources are Expiring Soon</h1>
      <p>Hi ${params.name},</p>
      <p>This is a reminder that the following resources will expire in ${params.daysUntilExpiry} days:</p>
      <pre>${resourceList}</pre>
      <p>We've attached XML metadata backups for your records.</p>
      <p>If you need to extend these resources, please log in to your dashboard.</p>
      <p>Best regards,<br>The MockAuth Team</p>
    `;

    await this.sendEmail({
      to: params.email,
      subject: `Your MockAuth resources expire in ${params.daysUntilExpiry} days`,
      html,
      attachments,
    });
  }

  static async sendExpiryNotificationEmail(params: {
    email: string;
    name: string;
    resources: Array<{ type: string; name: string }>;
  }): Promise<void> {
    const resourceList = params.resources
      .map(r => `- ${r.name} (${r.type})`)
      .join('\n');

    const html = `
      <h1>Your MockAuth Resources Have Been Deleted</h1>
      <p>Hi ${params.name},</p>
      <p>The following resources have expired and been deleted:</p>
      <pre>${resourceList}</pre>
      <p>You can create new resources anytime from your dashboard.</p>
      <p>Best regards,<br>The MockAuth Team</p>
    `;

    await this.sendEmail({
      to: params.email,
      subject: 'Your MockAuth resources have been deleted',
      html,
    });
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    const html = `
      <h1>Reset Your Password</h1>
      <p>You requested to reset your password for MockAuth.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>Best regards,<br>The MockAuth Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your MockAuth Password',
      html,
    });
  }
}
