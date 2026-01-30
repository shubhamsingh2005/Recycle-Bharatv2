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
            SELECT d.id as device_id, d.model, d.current_state, rj.job_status, rj.id as job_id
            FROM devices d
            JOIN refurbish_jobs rj ON d.id = rj.device_id
            ORDER BY rj.updated_at DESC
        `);
        console.log('--- RELEVANT DATA ---');
        res.rows.forEach(r => {
            console.log(`DeviceID: ${r.device_id}, Model: ${r.model}, State: ${r.current_state}, JobStatus: ${r.job_status}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
