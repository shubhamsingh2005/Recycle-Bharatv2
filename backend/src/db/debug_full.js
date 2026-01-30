const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        console.log('--- TABLES ---');
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.table(tables.rows);

        console.log('--- RECENT USERS ---');
        const users = await pool.query("SELECT id, email, role FROM users ORDER BY id DESC LIMIT 10");
        console.table(users.rows);

        console.log('--- RECENT DEVICES ---');
        const devices = await pool.query("SELECT id, owner_id, current_state FROM devices ORDER BY id DESC LIMIT 5");
        console.table(devices.rows);

        console.log('--- REFURBISH JOBS ---');
        const jobs = await pool.query("SELECT * FROM refurbish_jobs");
        console.table(jobs.rows);
    } catch (err) {
        console.error('❌ Error Details:', err.message);
        if (err.hint) console.log('Hint:', err.hint);
    } finally {
        await pool.end();
    }
};

run();
