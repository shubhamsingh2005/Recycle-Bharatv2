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
            SELECT d.id, d.model, d.current_state, rj.job_status
            FROM devices d
            LEFT JOIN refurbish_jobs rj ON d.id = rj.device_id
            WHERE rj.id IS NOT NULL
        `);
        console.log('JOBS_STATE_SYNC:');
        res.rows.forEach(r => {
            console.log(`ID:${r.id} | Model:${r.model} | DeviceState:${r.current_state} | JobStatus:${r.job_status}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
