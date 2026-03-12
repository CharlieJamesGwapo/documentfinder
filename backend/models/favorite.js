import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    documentId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    indexes: [
      { unique: true, fields: ['userId', 'documentId'] },
      { fields: ['userId'] }
    ]
  });

  return Favorite;
};
