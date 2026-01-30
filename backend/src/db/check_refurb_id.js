const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const res = await pool.query("SELECT id, email, role FROM users WHERE email = 'refurbisher@gmail.com'");
        if (res.rows.length > 0) {
            console.log(`FOUND: ID=${res.rows[0].id}, Email=${res.rows[0].email}, Role=${res.rows[0].role}`);
        } else {
            console.log('NOT FOUND: refurbisher@gmail.com');
        }

        const jobs = await pool.query("SELECT id, refurbisher_id, job_status FROM refurbish_jobs");
        console.log('JOBS_COUNT:', jobs.rows.length);
        jobs.rows.forEach(j => console.log(`Job ID: ${j.id}, RefurbID: ${j.refurbisher_id}, Status: ${j.job_status}`));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
