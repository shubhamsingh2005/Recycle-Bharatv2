const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const users = await pool.query("SELECT id, email, role FROM users WHERE role LIKE 'REFURB%'");
        console.log('REFURBISHERS_LIST:');
        users.rows.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`));

        const jobs = await pool.query("SELECT rj.id, rj.refurbisher_id, u.email as refurb_email FROM refurbish_jobs rj JOIN users u ON rj.refurbisher_id = u.id");
        console.log('JOBS_ASSIGNED_TO:');
        jobs.rows.forEach(j => console.log(`Job ID: ${j.id}, RefurbID: ${j.refurbisher_id}, Email: ${j.refurb_email}`));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
