const express = require('express');
const router = express.Router();
const PublicStatsController = require('../controllers/publicStatsController');

// Public route - no authentication required
router.get('/stats', PublicStatsController.getPublicStats);
router.get('/refurbishers', PublicStatsController.getRefurbishers);
router.get('/recyclers', PublicStatsController.getRecyclers);

module.exports = router;
