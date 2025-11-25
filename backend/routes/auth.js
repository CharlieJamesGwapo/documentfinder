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

const sendAndStoreOtp = async ({ user, code = generateOtp(), isRegistration = false }) => {
  await user.update({
    verificationCode: hashOtp(code),
    verificationExpires: otpExpiryDate()
  });

  await sendOtpEmail({ 
    to: user.email, 
    code, 
    name: user.name, 
    isRegistration
  });
  return code;
};

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('middleName').trim().optional({ checkFalsy: true }),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    body('suffix').trim().optional({ checkFalsy: true }),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role invalid'),
    body('photoData').notEmpty().withMessage('Profile photo is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
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

      console.log('📝 Registration attempt:', { firstName, middleName, lastName, suffix, email, role });

      const existing = await User.scope('withPassword').findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }

      if (!photoData?.startsWith('data:image')) {
        return res.status(400).json({ message: 'Profile photo must be an image data URL' });
      }

      // Compose full name before creating user to ensure it's not null
      const nameParts = [firstName, middleName, lastName]
        .map((part) => (part || '').trim())
        .filter(Boolean);
      let composedName = nameParts.join(' ');
      if (suffix) {
        composedName = `${composedName}, ${suffix.trim()}`;
      }
      composedName = composedName.trim() || 'User';

      console.log('📝 Composed name:', composedName);

      const user = await User.create({
        firstName: firstName || '',
        middleName: middleName || '',
        lastName: lastName || '',
        suffix: suffix || '',
        name: composedName,
        email,
        password,
        role: role === 'admin' ? 'admin' : 'user'
      });

      console.log('✅ User created:', user.id, 'Full name:', user.name);

      try {
        console.log('📸 Uploading photo to Cloudinary...');
        const upload = await cloudinary.uploader.upload(photoData, {
          folder: 'document-finder/users',
          resource_type: 'image',
          transformation: [{ width: 600, height: 600, crop: 'fill', gravity: 'face', quality: 'auto' }]
        });
        console.log('✅ Photo uploaded:', upload.public_id);
        await user.update({ photoUrl: upload.secure_url, photoPublicId: upload.public_id });
      } catch (uploadError) {
        console.error('❌ Photo upload error:', uploadError?.message || uploadError);
        await user.destroy();
        return res.status(500).json({ message: 'Unable to process profile photo. Please retry with a smaller image.' });
      }

      console.log('📧 Sending registration OTP email to:', user.email);
      try {
        await sendAndStoreOtp({ user, isRegistration: true });
      } catch (emailError) {
        console.warn('⚠️ Email failed but registration continues:', emailError.message);
      }
      
      await logAudit({
        userId: user.id,
        action: 'USER_REGISTERED',
        description: `${user.name} created an account`,
        ipAddress: req.ip
      });

      console.log('✅ Registration complete for:', user.email);
      res.status(201).json({
        requiresVerification: true,
        email: user.email
      });
    } catch (error) {
      console.error('❌ Register error:', error.message, error.stack);
      res.status(500).json({ message: 'Server error: ' + error.message });
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
        try {
          await sendAndStoreOtp({ user });
        } catch (emailError) {
          console.warn('⚠️ Email failed but OTP stored:', emailError.message);
        }
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

      try {
        await sendAndStoreOtp({ user });
      } catch (emailError) {
        console.warn('⚠️ Email failed but OTP stored:', emailError.message);
      }

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

router.post(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password min 6 chars')
  ],
  authenticate,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.scope('withPassword').findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      await user.update({ password: newPassword });

      await logAudit({
        userId: user.id,
        action: 'PASSWORD_CHANGED',
        description: `${user.name} changed their password`,
        ipAddress: req.ip
      });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Unable to change password' });
    }
  }
);

export default router;
