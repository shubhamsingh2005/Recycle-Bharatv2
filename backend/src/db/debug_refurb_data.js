const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        console.log('--- USERS (REFURBISHERS) ---');
        const users = await pool.query("SELECT id, email, role FROM users WHERE role LIKE 'REFURB%'");
        console.table(users.rows);

        console.log('--- REFURBISH JOBS ---');
        const jobs = await pool.query("SELECT id, device_id, refurbisher_id, job_status FROM refurbish_jobs");
        console.table(jobs.rows);
    } catch (err) {
        console.error('❌ Failed:', err);
    } finally {
        await pool.end();
    }
};

run();
