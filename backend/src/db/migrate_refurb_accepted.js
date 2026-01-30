const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        console.log('🔄 Adding REFURB_ACCEPTED to device_state enum...');
        await pool.query("ALTER TYPE device_state ADD VALUE IF NOT EXISTS 'REFURB_ACCEPTED'");
        console.log('✅ State added successfully.');
    } catch (err) {
        console.error('❌ Failed:', err);
    } finally {
        await pool.end();
    }
};

run();
