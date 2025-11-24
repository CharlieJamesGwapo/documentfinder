import { AuditLog } from '../models/index.js';

export const logAudit = async ({ userId = null, action, description, metadata = {}, ipAddress }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      description,
      metadata,
      ipAddress
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};
