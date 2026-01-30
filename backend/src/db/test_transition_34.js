const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        console.log('--- TEST TRANSITION ---');
        // Mock user
        const user = { id: 31, role: 'REFURBISHER' }; // Using ID 31 which is likely the refurbisher
        const LifecycleService = require('../src/services/lifecycle');

        const result = await LifecycleService.transitionState(34, 'PROPOSAL_PENDING', user);
        console.log('RESULT:', result);
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await pool.end();
    }
};

run();
