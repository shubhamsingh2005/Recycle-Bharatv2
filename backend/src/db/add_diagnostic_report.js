const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        console.log('🔄 Adding diagnostic_report to refurbish_jobs table...');
        await pool.query("ALTER TABLE refurbish_jobs ADD COLUMN IF NOT EXISTS diagnostic_report TEXT");
        console.log('✅ Column added successfully.');
    } catch (err) {
        console.error('❌ Failed:', err);
    } finally {
        await pool.end();
    }
};

run();
