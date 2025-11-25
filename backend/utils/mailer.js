import nodemailer from 'nodemailer';

const MAIL_USER = process.env.MAILER_USER;
const MAIL_PASS = process.env.MAILER_PASS;
const MAIL_FROM = process.env.MAILER_FROM || MAIL_USER;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
  pool: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 2000,
    rateLimit: 5
  }
});

export const sendOtpEmail = async ({ to, code, name, isRegistration = false }) => {
  if (!MAIL_USER || !MAIL_PASS) {
    console.error('❌ Email credentials missing:', { MAIL_USER, MAIL_PASS: MAIL_PASS ? '***' : 'missing' });
    throw new Error('Email credentials are not configured');
  }

  const subject = isRegistration 
    ? '🎉 Welcome to Tesla Ops - Enter Your Verification Code'
    : 'Tesla Ops verification code';

  const title = isRegistration
    ? 'Welcome to Tesla Ops!'
    : 'Verify your workspace access';

  const description = isRegistration
    ? `Hi ${name || 'there'},<br><br>Thank you for registering! To complete your account setup and gain full access to the Manufacturing & Quality Vault, please enter the verification code below in the Tesla Ops application.`
    : `Hi ${name || 'there'},<br><br>Use the one-time passcode below to verify your account. The code expires in 15 minutes.`;

  const html = `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; padding: 24px; background: #0b0c10; color: #f9fafb;">
      <div style="max-width: 520px; margin: 0 auto; background: #11131b; border-radius: 18px; padding: 32px; border: 1px solid rgba(255,255,255,0.08);">
        <div style="text-align: center; margin-bottom: 24px;">
          <p style="text-transform: uppercase; letter-spacing: 0.35em; color: #ff3c2f; font-size: 12px; margin: 0;">Tesla Ops</p>
        </div>
        <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #fff; text-align: center;">${title}</h1>
        <p style="color: #cbd5f5; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">${description}</p>
        
        <div style="margin: 32px 0; text-align: center;">
          <p style="color: #8794b4; font-size: 13px; margin: 0 0 12px 0;">Your verification code</p>
          <span style="display: inline-block; font-size: 48px; letter-spacing: 0.5em; padding: 24px 32px; border-radius: 16px; background: #1a1d2b; color: #ff3c2f; border: 2px solid #ff3c2f; font-weight: bold;">
            ${code}
          </span>
          <p style="color: #8794b4; font-size: 12px; margin: 16px 0 0 0;">Code expires in 15 minutes</p>
        </div>

        <div style="background: #0f1118; border-left: 3px solid #ff3c2f; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="color: #cbd5f5; font-size: 14px; margin: 0;"><strong>How to verify:</strong></p>
          <ol style="color: #cbd5f5; font-size: 14px; margin: 8px 0 0 0; padding-left: 20px;">
            <li>Go back to Tesla Ops application</li>
            <li>Enter the 6-digit code above</li>
            <li>Click "Verify Account"</li>
            <li>You're all set! Start accessing documents</li>
          </ol>
        </div>

        <div style="background: #ff3c2f/10; border: 1px solid #ff3c2f/30; padding: 12px; border-radius: 8px; margin: 16px 0; text-align: center;">
          <p style="color: #ff3c2f; font-size: 12px; margin: 0;"><strong>⚠️ Important:</strong> Never share this code with anyone. Tesla Ops staff will never ask for it.</p>
        </div>

        <p style="color: #8794b4; font-size: 13px; margin: 24px 0 0 0;">If you didn't create this account, you can safely ignore this message.</p>
        <p style="margin-top: 32px; color: #546389; font-size: 12px; text-align: center;">Tesla Manufacturing & Quality Vault · Secure document intelligence</p>
      </div>
    </div>
  `;

  try {
    console.log('📧 Sending OTP email to:', to, '(Registration:', isRegistration, ')');
    
    // Send email asynchronously without waiting
    transporter.sendMail({
      from: MAIL_FROM,
      to,
      subject,
      html
    }).then((info) => {
      console.log('✅ Email sent successfully:', info.messageId);
    }).catch((error) => {
      console.warn('⚠️ Email send failed (async):', error.message);
    });

    // Return immediately without waiting for email
    console.log('📧 Email queued for sending');
    return { messageId: 'queued-' + Date.now() };
  } catch (error) {
    console.error('❌ Email queue error:', error.message);
    console.warn('⚠️ Continuing - user can still verify later');
    return { messageId: 'failed-' + Date.now(), error: error.message };
  }
};
