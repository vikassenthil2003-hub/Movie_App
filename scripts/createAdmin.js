const path = require('path');
const fs = require('fs');

// 1. Resolve and load .env from known locations safely
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

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineverse_ai';
    await mongoose.connect(mongoUri);
    console.log('[Bootstrap] Connected to MongoDB at:', mongoUri);

    const adminEmail = (parseArg('email') || process.env.ADMIN_EMAIL || 'admin@cineverse.com').toLowerCase().trim();
    const adminPassword = parseArg('password') || process.env.ADMIN_PASSWORD || 'Admin@CineVerse2026';
    const adminName = parseArg('name') || process.env.ADMIN_NAME || 'CineVerse SuperAdmin';
    const adminPhone = parseArg('phone') || process.env.ADMIN_PHONE || '9876543210';
    const allowPasswordReset = hasFlag('reset-password') || hasFlag('force');

    if (adminPassword.length < 6) {
      throw new Error('Admin password must be at least 6 characters long.');
    }

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      let modified = false;

      if (admin.role !== 'admin') {
        admin.role = 'admin';
        modified = true;
        console.log(`[Bootstrap] Elevating existing user '${adminEmail}' to administrator role.`);
      }

      if (allowPasswordReset) {
        admin.password = adminPassword; // Pre-save hook will hash with bcrypt
        modified = true;
        console.log(`[Bootstrap] Explicit password reset applied for administrator '${adminEmail}'.`);
      } else {
        console.log(`[Bootstrap] Administrator '${adminEmail}' already exists. Preserving existing password.`);
        console.log(`[Bootstrap] (Pass --reset-password flag if you explicitly wish to overwrite the password).`);
      }

      if (modified) {
        await admin.save();
      }
    } else {
      admin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword, // Pre-save hook will hash with bcrypt
        phone: adminPhone,
        role: 'admin',
        preferences: { city: 'Chennai' },
        membershipTier: 'Platinum',
        rewardPoints: 1000,
      });

      await admin.save();
      console.log(`[Bootstrap] New administrator '${adminEmail}' created successfully!`);
    }

    console.log('====================================================');
    console.log('👑 CineVerse AI Admin Bootstrap:');
    console.log(`   Email:  ${adminEmail}`);
    console.log(`   Role:   admin`);
    console.log(`   Status: Verified & Active in Database`);
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Bootstrap Error] Failed to bootstrap administrator:', error.message);
    if (mongoose?.connection?.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    process.exit(1);
  }
};

if (require.main === module) {
  createAdmin();
}

module.exports = { createAdmin };
