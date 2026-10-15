const path = require('path');
const fs = require('fs');

// 1. Resolve and load .env safely
const potentialEnvPaths = [
  path.resolve(__dirname, '../backend/.env'),
  path.resolve(__dirname, './backend/.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of potentialEnvPaths) {
  if (fs.existsSync(envPath)) {
    try {
      const dotenvModule = require(path.resolve(__dirname, '../backend/node_modules/dotenv'));
      dotenvModule.config({ path: envPath });
    } catch {
      try {
        require('dotenv').config({ path: envPath });
      } catch (err) {
        // Continue with environment variables already set
      }
    }
    break;
  }
}

// 2. Resolve mongoose and User model safely
let mongoose;
try {
  mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));
} catch {
  mongoose = require('mongoose');
}

const User = require(path.resolve(__dirname, '../backend/src/models/User'));

// 3. Parse command-line arguments
const parseArg = (flag) => {
  const match = process.argv.find((arg) => arg.startsWith(`--${flag}=`));
  return match ? match.split('=')[1] : null;
};

const hasFlag = (flag) => process.argv.includes(`--${flag}`);

const createCustomer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineverse_ai';
    await mongoose.connect(mongoUri);
    console.log('[Customer Setup] Connected to MongoDB at:', mongoUri);

    const customerEmail = (parseArg('email') || process.env.CUSTOMER_EMAIL || 'customer@cineverse.com').toLowerCase().trim();
    const customerPassword = parseArg('password') || process.env.CUSTOMER_PASSWORD || 'Customer@CineVerse2026';
    const customerName = parseArg('name') || process.env.CUSTOMER_NAME || 'Demo Moviegoer';
    const customerPhone = parseArg('phone') || process.env.CUSTOMER_PHONE || '9876543211';
    const allowPasswordReset = hasFlag('reset-password') || hasFlag('force');

    if (customerPassword.length < 6) {
      throw new Error('Customer password must be at least 6 characters long.');
    }

    let customer = await User.findOne({ email: customerEmail });

    if (customer) {
      let modified = false;

      // Customer account must strictly possess role 'user'
      if (customer.role !== 'user') {
        customer.role = 'user';
        modified = true;
        console.log(`[Customer Setup] Ensuring account '${customerEmail}' possesses role 'user'.`);
      }

      if (allowPasswordReset) {
        customer.password = customerPassword; // Pre-save hook will hash with bcrypt
        modified = true;
        console.log(`[Customer Setup] Explicit password reset applied for customer '${customerEmail}'.`);
      } else {
        console.log(`[Customer Setup] Customer '${customerEmail}' already exists. Preserving existing password.`);
        console.log(`[Customer Setup] (Pass --reset-password flag if you explicitly wish to overwrite the password).`);
      }

      if (modified) {
        await customer.save();
      }
    } else {
      customer = new User({
        name: customerName,
        email: customerEmail,
        password: customerPassword, // Pre-save hook will hash with bcrypt
        phone: customerPhone,
        role: 'user', // Enforce customer role strictly
        preferences: { city: 'Chennai' },
        membershipTier: 'Silver',
        rewardPoints: 150,
      });

      await customer.save();
      console.log(`[Customer Setup] New customer account '${customerEmail}' registered successfully!`);
    }

    console.log('====================================================');
    console.log('🎟️ CineVerse AI Customer Setup:');
    console.log(`   Name:   ${customer.name}`);
    console.log(`   Email:  ${customerEmail}`);
    console.log(`   Role:   user (Customer)`);
    console.log(`   Points: ${customer.rewardPoints}`);
    console.log(`   Status: Verified & Active in Database`);
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Customer Setup Error] Failed to register customer account:', error.message);
    if (mongoose?.connection?.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    process.exit(1);
  }
};

if (require.main === module) {
  createCustomer();
}

module.exports = { createCustomer };
