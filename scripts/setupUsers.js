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
      } catch (err) {}
    }
    break;
  }
}

let mongoose;
try {
  mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));
} catch {
  mongoose = require('mongoose');
}

const { ensureAllDemoAccounts } = require('../backend/src/utils/bootstrapAdmin');

const setupUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineverse_ai';
    await mongoose.connect(mongoUri);
    console.log('[Setup Users] Connected to MongoDB at:', mongoUri);

    console.log('[Setup Users] Ensuring all demonstration accounts exist...');
    const accounts = await ensureAllDemoAccounts();

    console.log('================================================================');
    console.log('🎬 CineVerse AI Verified Demonstration Accounts:');
    console.log('================================================================');
    console.log('| Role        | Portal Mode    | Email                  | Default Pass        |');
    console.log('| :---------- | :------------- | :--------------------- | :------------------ |');
    console.log(`| Customer    | Customer Login | ${accounts.customer?.email || 'customer@cineverse.com'}   | Customer@CineVerse2026 |`);
    console.log(`| Admin       | Admin Login    | ${accounts.admin?.email || 'admin@cineverse.com'}      | Admin@CineVerse2026    |`);
    console.log(`| Theatre     | Theatre Login  | ${accounts.theatre?.email || 'theatre@cineverse.com'}    | Theatre@CineVerse2026  |`);
    console.log('================================================================');
    console.log('✅ All roles successfully verified in MongoDB.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Setup Users Error]:', error.message);
    if (mongoose?.connection?.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    process.exit(1);
  }
};

if (require.main === module) {
  setupUsers();
}

module.exports = { setupUsers };
