const express = require('express');
const router = express.Router();
const RefurbishController = require('../controllers/refurbishController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

// Get jobs for refurbisher
router.get('/jobs', authenticate, authorize(['REFURBISHER', 'REFURBISHER_AGENT', 'ADMIN']), RefurbishController.getPendingJobs);

// Refurbisher accept job
router.post('/accept-job', authenticate, authorize(['REFURBISHER']), RefurbishController.acceptJob);

// Get agents for refurbisher
router.get('/agents', authenticate, authorize(['REFURBISHER']), RefurbishController.getAgents);

// Refurbisher assign agent
router.post('/assign-agent', authenticate, authorize(['REFURBISHER']), RefurbishController.assignAgent);

// Agent verify pickup
router.post('/verify-pickup', authenticate, authorize(['REFURBISHER_AGENT']), RefurbishController.verifyPickupCode);

// Refurbisher verify facility arrival
router.post('/confirm-arrival', authenticate, authorize(['REFURBISHER']), RefurbishController.verifyArrivalAtCenter);

// Submit diagnostic proposal
router.post('/proposal', authenticate, authorize(['REFURBISHER']), RefurbishController.submitProposal);

// Citizen respond to proposal
router.post('/respond', authenticate, authorize(['CITIZEN']), RefurbishController.respondToProposal);

// Refurbisher handover waste
router.post('/waste-handover', authenticate, authorize(['REFURBISHER']), RefurbishController.requestWastePickup);

// Citizen verify return
router.post('/verify-return', authenticate, authorize(['CITIZEN']), RefurbishController.verifyReturnCode);

module.exports = router;
