import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';
import { sendOtpEmail } from '../utils/mailer.js';
import cloudinary from '../config/cloudinary.js';

const router = Router();

const signToken = (user) => jwt.sign(
  {
    id: user.id,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const OTP_EXPIRATION_MINUTES = Number(process.env.OTP_TTL_MINUTES || 15);

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOtp = (code) => crypto.createHash('sha256').update(code).digest('hex');
const otpExpiryDate = () => new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

const sendAndStoreOtp = async ({ user, code = generateOtp() }) => {
  await user.update({
    verificationCode: hashOtp(code),
    verificationExpires: otpExpiryDate()
  });

  await sendOtpEmail({ to: user.email, code, name: user.name });
  return code;
};

router.post(
  '/register',
  [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name required'),
    body('middleName').trim().isLength({ min: 2 }).withMessage('Middle name required'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name required'),
    body('suffix').optional().isLength({ max: 30 }).withMessage('Suffix too long'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role invalid'),
    body('photoData').notEmpty().withMessage('Profile photo is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        firstName,
        middleName,
        lastName,
        suffix,
        email,
        password,
        role,
        photoData
      } = req.body;
      const existing = await User.scope('withPassword').findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }

      if (!photoData?.startsWith('data:image')) {
        return res.status(400).json({ message: 'Profile photo must be an image data URL' });
      }

      const otp = generateOtp();
      const user = await User.create({
        firstName,
        middleName,
        lastName,
        suffix,
        email,
        password,
        role: role === 'admin' ? 'admin' : 'user',
        verificationCode: hashOtp(otp),
        verificationExpires: otpExpiryDate()
      });

      try {
        const upload = await cloudinary.uploader.upload(photoData, {
          folder: 'document-finder/users',
          resource_type: 'image',
          transformation: [{ width: 600, height: 600, crop: 'fill', gravity: 'face', quality: 'auto' }]
        });
        await user.update({ photoUrl: upload.secure_url, photoPublicId: upload.public_id });
      } catch (uploadError) {
        await user.destroy();
        console.error('Photo upload error:', uploadError?.message || uploadError);
        return res.status(500).json({ message: 'Unable to process profile photo. Please retry with a smaller image.' });
      }

      await sendOtpEmail({ to: user.email, code: otp, name: user.name });
      await logAudit({
        userId: user.id,
        action: 'USER_REGISTERED',
        description: `${user.name} created an account`,
        ipAddress: req.ip
      });

      res.status(201).json({
        requiresVerification: true,
        email: user.email
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.scope('withPassword').findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        await sendAndStoreOtp({ user });
        return res.status(403).json({
          message: 'Account not verified. A fresh code was sent to your email.',
          requiresVerification: true,
          email: user.email
        });
      }

      await user.update({ lastLogin: new Date() });
      const token = signToken(user);
      await logAudit({
        userId: user.id,
        action: 'USER_LOGGED_IN',
        description: `${user.name} signed in`,
        ipAddress: req.ip
      });
      res.json({ token, user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('6-digit code required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, code } = req.body;
      const user = await User.scope('withPassword').findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'Account not found' });
      }

      if (user.isVerified) {
        const token = signToken(user);
        return res.json({ token, user });
      }

      if (!user.verificationCode || !user.verificationExpires) {
        return res.status(400).json({ message: 'Verification code missing. Request a new one.' });
      }

      const hashed = hashOtp(code);
      if (user.verificationCode !== hashed || user.verificationExpires < new Date()) {
        return res.status(400).json({ message: 'Code invalid or expired' });
      }

      await user.update({
        isVerified: true,
        verificationCode: null,
        verificationExpires: null
      });

      const safeUser = await User.findByPk(user.id);
      const token = signToken(safeUser);

      await logAudit({
        userId: user.id,
        action: 'USER_VERIFIED',
        description: `${user.name} verified their email`,
        ipAddress: req.ip
      });

      res.json({ token, user: safeUser });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ message: 'Unable to verify code' });
    }
  }
);

router.post(
  '/resend-otp',
  [body('email').isEmail().withMessage('Valid email required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'Account not found' });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'Account already verified' });
      }

      await sendAndStoreOtp({ user });

      await logAudit({
        userId: user.id,
        action: 'OTP_RESENT',
        description: `Resent verification code to ${user.email}`,
        ipAddress: req.ip
      });

      res.json({ message: 'Verification code resent' });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ message: 'Unable to resend code' });
    }
  }
);

router.post(
  '/request-reset',
  [body('email').isEmail().withMessage('Valid email required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.scope('withPassword').findOne({ where: { email: req.body.email } });
      if (!user) {
        return res.status(200).json({ message: 'If the email exists, reset instructions were sent.' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      await user.update({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000)
      });

      console.log(`Password reset token for ${user.email}: ${resetToken}`);
      await logAudit({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        description: `${user.name} requested a password reset`,
        ipAddress: req.ip
      });

      res.json({ message: 'Reset instructions sent (check server log for token in dev).' });
    } catch (error) {
      console.error('Reset request error:', error);
      res.status(500).json({ message: 'Unable to process reset request' });
    }
  }
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
      const user = await User.scope('withPassword').findOne({
        where: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { [User.sequelize.Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'Token invalid or expired' });
      }

      await user.update({
        password: req.body.password,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      await logAudit({
        userId: user.id,
        action: 'PASSWORD_RESET_COMPLETED',
        description: `${user.name} reset their password`,
        ipAddress: req.ip
      });

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Unable to reset password' });
    }
  }
);

export default router;
