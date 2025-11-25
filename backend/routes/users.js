import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import { User } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Unable to fetch profile' });
  }
});

// Update current user profile
router.put(
  '/profile',
  authenticate,
  [
    body('firstName').optional().trim().notEmpty().withMessage('First name required'),
    body('middleName').optional().trim(),
    body('lastName').optional().trim().notEmpty().withMessage('Last name required'),
    body('suffix').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const payload = {
        firstName: req.body.firstName ?? user.firstName,
        middleName: req.body.middleName ?? user.middleName,
        lastName: req.body.lastName ?? user.lastName,
        suffix: req.body.suffix ?? user.suffix
      };

      await user.update(payload);
      const updated = await User.findByPk(user.id);

      await logAudit({
        userId: req.user.id,
        action: 'PROFILE_UPDATED',
        description: `${user.name} updated their profile`,
        ipAddress: req.ip
      });

      res.json(updated);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Unable to update profile' });
    }
  }
);

// Admin: Get all users
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Unable to fetch users' });
  }
});

// Admin/Self: Get specific user
router.get('/:id', authenticate, async (req, res) => {
  try {
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Unable to fetch user' });
  }
});

// Admin: Update user
router.put(
  '/:id',
  authenticate,
  [
    body('firstName').optional().isLength({ min: 2 }).withMessage('First name too short'),
    body('middleName').optional().isLength({ min: 2 }).withMessage('Middle name too short'),
    body('lastName').optional().isLength({ min: 2 }).withMessage('Last name too short'),
    body('suffix').optional().isLength({ max: 30 }).withMessage('Suffix too long'),
    body('email').optional().isEmail().withMessage('Email invalid'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role invalid')
  ],
  async (req, res) => {
    try {
      if (req.params.id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.scope('withPassword').findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const payload = {
        firstName: req.body.firstName ?? user.firstName,
        middleName: req.body.middleName ?? user.middleName,
        lastName: req.body.lastName ?? user.lastName,
        suffix: req.body.suffix ?? user.suffix,
        email: req.body.email ?? user.email,
        isActive: req.body.isActive ?? user.isActive
      };

      if (req.body.role && req.user.role === 'admin') {
        payload.role = req.body.role;
      }

      if (req.body.photoUrl) {
        payload.photoUrl = req.body.photoUrl;
      }

      if (req.body.password) {
        payload.password = req.body.password;
      }

      await user.update(payload);
      const sanitized = await User.findByPk(user.id);
      await logAudit({
        userId: req.user.id,
        action: 'USER_UPDATED',
        description: `${req.user.name} updated ${user.name}`,
        metadata: { targetUser: user.id },
        ipAddress: req.ip
      });
      res.json(sanitized);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Unable to update user' });
    }
  }
);

// Admin: Deactivate user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ isActive: false });
    await logAudit({
      userId: req.user.id,
      action: 'USER_DEACTIVATED',
      description: `${req.user.name} deactivated ${user.name}`,
      metadata: { targetUser: user.id },
      ipAddress: req.ip
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Unable to delete user' });
  }
});

export default router;
