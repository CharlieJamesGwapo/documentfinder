import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    documentType: {
      type: DataTypes.ENUM('manufacturing', 'quality'),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    version: {
      type: DataTypes.STRING(12),
      defaultValue: '1.0.0'
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePublicId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileType: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    indexes: [
      { fields: ['title'] },
      { fields: ['category'] },
      { fields: ['documentType'] }
    ]
  });

  return Document;
};
