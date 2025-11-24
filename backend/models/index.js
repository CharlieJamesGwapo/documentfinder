import { Sequelize } from 'sequelize';
import dbConfig from '../config/database.js';
import UserModel from './user.js';
import DocumentModel from './document.js';
import AuditLogModel from './auditLog.js';

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const User = UserModel(sequelize);
const Document = DocumentModel(sequelize);
const AuditLog = AuditLogModel(sequelize);

User.hasMany(Document, { foreignKey: 'createdBy', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'createdBy', as: 'author' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'logs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'actor' });

export { sequelize, Sequelize, User, Document, AuditLog };
