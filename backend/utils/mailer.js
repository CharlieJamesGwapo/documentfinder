import nodemailer from 'nodemailer';

const MAIL_USER = process.env.MAILER_USER;
const MAIL_PASS = process.env.MAILER_PASS;
const MAIL_FROM = process.env.MAILER_FROM || MAIL_USER;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS
  }
});

export const sendOtpEmail = async ({ to, code, name }) => {
  if (!MAIL_USER || !MAIL_PASS) {
    throw new Error('Email credentials are not configured');
  }

  const html = `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; padding: 24px; background: #0b0c10; color: #f9fafb;">
      <div style="max-width: 520px; margin: 0 auto; background: #11131b; border-radius: 18px; padding: 32px; border: 1px solid rgba(255,255,255,0.08);">
        <p style="text-transform: uppercase; letter-spacing: 0.35em; color: #ff3c2f; font-size: 12px; margin-bottom: 12px;">Tesla Ops</p>
        <h1 style="margin: 0; font-size: 24px; color: #fff;">Verify your workspace access</h1>
        <p style="color: #cbd5f5; font-size: 15px; line-height: 1.6;">Hi ${name || 'there'},</p>
        <p style="color: #cbd5f5; font-size: 15px; line-height: 1.6;">Use the one-time passcode below to verify your account. The code expires in 15 minutes.</p>
        <div style="margin: 32px 0; text-align: center;">
          <span style="display: inline-block; font-size: 32px; letter-spacing: 0.3em; padding: 18px 24px; border-radius: 16px; background: #1a1d2b; color: #fff; border: 1px solid rgba(255,255,255,0.08);">
            ${code}
          </span>
        </div>
        <p style="color: #8794b4; font-size: 13px;">If you didn’t request this, you can safely ignore this message.</p>
        <p style="margin-top: 32px; color: #546389; font-size: 12px;">Tesla Manufacturing & Quality Vault · Secure document intelligence</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: 'Tesla Ops verification code',
    html
  });
};
