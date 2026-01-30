const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        await pool.query("ALTER TABLE devices ADD COLUMN IF NOT EXISTS is_refurbished BOOLEAN DEFAULT false;");
        console.log('✅ Added is_refurbished column to devices table.');
    } catch (err) {
        console.error('❌ Failed:', err);
    } finally {
        await pool.end();
    }
};

run();
