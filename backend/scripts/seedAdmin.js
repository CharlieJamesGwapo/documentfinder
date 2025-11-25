import dotenv from 'dotenv';
import { sequelize, User } from '../models/index.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: 'melanie@admin.com' }
    });

    if (existingAdmin) {
      console.log('⚠️ Admin account already exists');
      process.exit(0);
    }

    // Create admin account
    const admin = await User.create({
      firstName: 'Melanie',
      middleName: 'Chavaria',
      lastName: 'Birmingham',
      suffix: '',
      email: 'melanie@admin.com',
      password: "Ma'am123",
      role: 'admin',
      isVerified: true,
      photoUrl: 'https://via.placeholder.com/150?text=Melanie',
      photoPublicId: 'placeholder-admin'
    });

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: melanie@admin.com');
    console.log('🔐 Password: Ma\'am123');
    console.log('👤 Name: Melanie Chavaria Birmingham');
    console.log('📊 Role: admin');
    console.log('✔️ Verified: Yes');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    process.exit(1);
  }
};

seedAdmin();
