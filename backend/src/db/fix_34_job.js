const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        console.log('--- FIXING JOB STATUS FOR 34 ---');
        await pool.query("UPDATE refurbish_jobs SET job_status = 'PROPOSED' WHERE device_id = 34");
        console.log('DONE');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
