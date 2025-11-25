import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

const composeFullName = (user) => {
  const segments = [user.firstName, user.middleName, user.lastName]
    .map((value) => value?.trim())
    .filter(Boolean);
  let fullName = segments.join(' ');
  if (user.suffix) {
    fullName = `${fullName}, ${user.suffix.trim()}`;
  }
  // eslint-disable-next-line no-param-reassign
  user.name = fullName.trim();
};

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: ''
    },
    middleName: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: ''
    },
    lastName: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: ''
    },
    suffix: {
      type: DataTypes.STRING(30)
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: true,
      defaultValue: 'User'
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastLogin: {
      type: DataTypes.DATE
    },
    resetPasswordToken: {
      type: DataTypes.STRING
    },
    resetPasswordExpires: {
      type: DataTypes.DATE
    },
    verificationCode: {
      type: DataTypes.STRING
    },
    verificationExpires: {
      type: DataTypes.DATE
    },
    photoUrl: {
      type: DataTypes.STRING(255)
    },
    photoPublicId: {
      type: DataTypes.STRING(255)
    }
  }, {
    hooks: {
      beforeValidate: (user) => {
        composeFullName(user);
      },
      async beforeCreate(user) {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          // eslint-disable-next-line no-param-reassign
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      async beforeUpdate(user) {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          // eslint-disable-next-line no-param-reassign
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: {}
      }
    }
  });

  User.prototype.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
  };

  return User;
};
