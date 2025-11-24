import { Router } from 'express';
import { AuditLog, User } from '../models/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      limit: Number(req.query.limit) || 25,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'actor',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json(logs);
  } catch (error) {
    console.error('Audit fetch error:', error);
    res.status(500).json({ message: 'Unable to fetch audit logs' });
  }
});

export default router;
