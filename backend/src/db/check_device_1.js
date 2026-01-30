const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const res = await pool.query("SELECT id, model, current_state FROM devices WHERE model = '1'");
        console.log('--- DEVICE CHECK ---');
        console.log(JSON.stringify(res.rows, null, 2));

        const jobs = await pool.query("SELECT device_id, job_status FROM refurbish_jobs WHERE device_id IN (SELECT id FROM devices WHERE model = '1')");
        console.log('--- JOB CHECK ---');
        console.log(JSON.stringify(jobs.rows, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
