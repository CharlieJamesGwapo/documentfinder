import dotenv from 'dotenv';
import { sequelize, User } from '../models/index.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('[OK] Database connection established');

    // Seed admin account
    const existingAdmin = await User.findOne({
      where: { email: 'melanie@admin.com' }
    });

    if (existingAdmin) {
      console.log('[OK] Admin account already exists');
    } else {
      await User.create({
        firstName: 'Melanie',
        middleName: '',
        lastName: 'Birmingham',
        suffix: '',
        email: 'melanie@admin.com',
        password: "Ma'am123",
        role: 'admin',
        isVerified: true,
        photoUrl: null,
        photoPublicId: null
      });

      console.log('[OK] Admin account created successfully!');
      console.log('Email: melanie@admin.com');
      console.log("Password: Ma'am123");
      console.log('Name: Melanie Birmingham');
      console.log('Role: admin');
      console.log('[OK] Verified: Yes');
    }

    // Seed default user account
    const existingUser = await User.findOne({
      where: { email: 'user@user.com' }
    });

    if (existingUser) {
      console.log('[OK] Default user account already exists');
    } else {
      await User.create({
        firstName: 'Default',
        middleName: '',
        lastName: 'User',
        suffix: '',
        email: 'user@user.com',
        password: 'user',
        role: 'user',
        isVerified: true,
        photoUrl: null,
        photoPublicId: null
      });

      console.log('[OK] Default user account created!');
      console.log('Email: user@user.com');
      console.log('Password: user');
      console.log('Name: Default User');
      console.log('Role: user');
    }

    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Error seeding accounts:', error.message);
    process.exit(1);
  }
};

seedAdmin();
