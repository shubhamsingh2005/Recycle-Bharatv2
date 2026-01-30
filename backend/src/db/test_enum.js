const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        console.log('--- TEST ENUM INSERT ---');
        await pool.query('BEGIN');
        await pool.query('CREATE TEMP TABLE test_enum (s device_state)');
        await pool.query("INSERT INTO test_enum VALUES ('PROPOSAL_PENDING')");
        console.log('INSERT SUCCESSFUL');
        await pool.query('ROLLBACK');
    } catch (err) {
        console.error('INSERT FAILED:', err.message);
    } finally {
        await pool.end();
    }
};

run();
