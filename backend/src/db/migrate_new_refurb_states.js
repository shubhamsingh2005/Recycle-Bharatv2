const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        console.log('🔄 Adding new states to device_state enum...');
        // Postgres enum additions cannot be done inside a transaction easily
        await pool.query("ALTER TYPE device_state ADD VALUE IF NOT EXISTS 'REFURB_AGENT_ASSIGNED'");
        await pool.query("ALTER TYPE device_state ADD VALUE IF NOT EXISTS 'REFURB_PICKED_UP'");
        console.log('✅ States added successfully.');
    } catch (err) {
        console.error('❌ Failed:', err);
    } finally {
        await pool.end();
    }
};

run();
