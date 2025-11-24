import { Router } from 'express';
import authRoutes from './auth.js';
import documentRoutes from './documents.js';
import userRoutes from './users.js';
import auditRoutes from './audit.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/documents', authenticate, documentRoutes);
router.use('/users', authenticate, userRoutes);
router.use('/audit', authenticate, authorize('admin'), auditRoutes);

export default router;
