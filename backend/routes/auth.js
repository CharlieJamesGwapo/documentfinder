import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

const signToken = (user) => jwt.sign(
  {
    id: user.id,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, role } = req.body;
      const existing = await User.scope('withPassword').findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role === 'admin' ? 'admin' : 'user'
      });

      const token = signToken(user);
      await logAudit({
        userId: user.id,
        action: 'USER_REGISTERED',
        description: `${user.name} created an account`,
        ipAddress: req.ip
      });
      res.status(201).json({
        token,
        user
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
