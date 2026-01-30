const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const LifecycleService = require('../services/lifecycle');

const run = async () => {
    try {
        console.log('--- TEST TRANSITION ---');
        const user = { id: 31, role: 'REFURBISHER' };
        const result = await LifecycleService.transitionState(34, 'PROPOSAL_PENDING', user);
        console.log('SUCCESS:', result);
    } catch (err) {
        console.error('FAILED:', err);
    } finally {
        process.exit();
    }
};

run();
