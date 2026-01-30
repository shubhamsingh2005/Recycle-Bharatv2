const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const device = await pool.query("SELECT * FROM devices WHERE id = 34");
        const job = await pool.query("SELECT * FROM refurbish_jobs WHERE device_id = 34");

        console.log('--- DEVICE 34 ---');
        console.log(device.rows[0]);
        console.log('--- JOB 34 ---');
        console.log(job.rows[0]);

        const events = await pool.query("SELECT * FROM lifecycle_events WHERE device_id = 34 ORDER BY timestamp DESC LIMIT 5");
        console.log('--- RECENT EVENTS ---');
        console.table(events.rows);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
