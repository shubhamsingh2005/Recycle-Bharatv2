const { eventBus, EVENTS } = require('../services/eventService');
const IncentiveService = require('../services/incentiveService');
const MockIncentiveService = require('../services/mockIncentiveService');
const { pool } = require('../config/db');

const Service = process.env.USE_MOCK_DB === 'true' ? MockIncentiveService : IncentiveService;

const initIncentiveSubscriber = () => {
    eventBus.on(EVENTS.STATUS_CHANGE, async ({ device, userId }) => {
        if (device.status === 'DELIVERED_TO_RECYCLER') {
            console.log(`[Subscriber] Device ${device._id} reached verified delivery. Triggering incentive...`);
            try {
                // Determine who gets the reward
                // If the device reached this state via a Refurbisher handover, reward the Refurbisher.
                // Otherwise, reward the Citizen owner.

                const requestRes = await pool.query(
                    'SELECT sender_type, citizen_id FROM recycling_requests WHERE device_id = $1',
                    [device.id]
                );

                let rewardUserId = device.ownerId; // Default to Citizen

                if (requestRes.rows.length > 0 && requestRes.rows[0].sender_type === 'REFURBISHER') {
                    // Reward the refurbisher who triggered the handover
                    rewardUserId = userId;
                    console.log(`[Subscriber] Rewarding Refurbisher (ID: ${rewardUserId}) for waste handover.`);
                } else {
                    console.log(`[Subscriber] Rewarding Citizen (ID: ${rewardUserId}) for recycling.`);
                }

                await Service.issueReward({
                    userId: rewardUserId,
                    deviceId: device.id
                });
            } catch (err) {
                console.error('[Subscriber] Failed to issue incentive:', err.message);
            }
        }
    });
};

module.exports = initIncentiveSubscriber;
