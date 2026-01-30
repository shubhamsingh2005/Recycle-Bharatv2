const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const d = await pool.query("SELECT current_state FROM devices WHERE id = 34");
        const j = await pool.query("SELECT job_status FROM refurbish_jobs WHERE device_id = 34");
        console.log(`DEVICE_STATE: ${d.rows[0].current_state}`);
        console.log(`JOB_STATUS: ${j.rows[0].job_status}`);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
