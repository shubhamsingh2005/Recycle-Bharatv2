const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const res = await pool.query(`
            SELECT id, model, current_state FROM devices WHERE id = 34
        `);
        console.log('--- DEVICE 34 ---');
        console.log(JSON.stringify(res.rows, null, 2));

        const jobs = await pool.query(`
            SELECT * FROM refurbish_jobs WHERE device_id = 34
        `);
        console.log('--- JOB 34 ---');
        console.log(JSON.stringify(jobs.rows, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
