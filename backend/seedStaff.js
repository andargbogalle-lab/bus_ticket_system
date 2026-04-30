import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const seedStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create Agent
    const agentExists = await User.findOne({ username: 'agent1' });
    if (!agentExists) {
      await User.create({
        username: 'agent1',
        password: 'agent123',
        fullName: 'Jane Agent',
        role: 'agent',
        phone: '0911223344',
      });
      console.log('Agent created: agent1 / agent123');
    } else {
      console.log('Agent already exists');
    }

    console.log('\n✅ Staff seeding completed!');
    console.log('Available accounts:');
    console.log('  - Admin: admin / admin123');
    console.log('  - Agent: agent1 / agent123');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedStaff();
