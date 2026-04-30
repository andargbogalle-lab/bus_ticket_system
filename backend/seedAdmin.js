import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      fullName: 'System Administrator',
      role: 'admin',
      phone: '',
    });

    console.log(`Admin user created successfully:`);
    console.log(`  Username: admin`);
    console.log(`  Password: admin123`);
    console.log(`  Role: ${admin.role}`);

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
