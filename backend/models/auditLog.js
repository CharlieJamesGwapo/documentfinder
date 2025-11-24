import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255)
    },
    metadata: {
      type: DataTypes.JSONB
    },
    ipAddress: {
      type: DataTypes.STRING(64)
    }
  }, {
    indexes: [
      { fields: ['action'] },
      { fields: ['userId'] }
    ]
  });

  return AuditLog;
};
