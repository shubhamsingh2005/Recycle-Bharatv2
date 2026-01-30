const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));

        const users = await pool.query("SELECT id, email, role FROM users WHERE role LIKE 'REFURB%'");
        console.log('Refurbishers:', JSON.stringify(users.rows));

        const jobs = await pool.query("SELECT id, device_id, refurbisher_id, job_status FROM refurbish_jobs");
        console.log('Jobs:', JSON.stringify(jobs.rows));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
