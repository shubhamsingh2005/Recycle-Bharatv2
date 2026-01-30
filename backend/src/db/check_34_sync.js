const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const res = await pool.query("SELECT d.id, d.current_state, rj.job_status FROM devices d LEFT JOIN refurbish_jobs rj ON d.id = rj.device_id WHERE d.id = 34");
        console.log('DEVICE_INFO:', JSON.stringify(res.rows[0]));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
