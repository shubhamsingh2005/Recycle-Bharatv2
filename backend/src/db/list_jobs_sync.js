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
            SELECT rj.device_id, rj.job_status, d.current_state, d.model
            FROM refurbish_jobs rj
            JOIN devices d ON rj.device_id = d.id
        `);
        res.rows.forEach(r => {
            console.log(`DeviceID: ${r.device_id}, Model: ${r.model}, Job: ${r.job_status}, Device: ${r.current_state}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
