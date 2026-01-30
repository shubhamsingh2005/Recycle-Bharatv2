const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const users = await pool.query("SELECT id, email, role FROM users");
        const jobs = await pool.query("SELECT * FROM refurbish_jobs");
        const devices = await pool.query("SELECT id, current_state FROM devices");

        const output = {
            users: users.rows,
            jobs: jobs.rows,
            devices: devices.rows
        };

        console.log('--- DATA DUMP START ---');
        console.log(JSON.stringify(output, null, 2));
        console.log('--- DATA DUMP END ---');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
