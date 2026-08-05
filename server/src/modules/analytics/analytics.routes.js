const express = require('express');
const { getHeatmapData, getStats } = require('./analytics.controller');

const router = express.Router();

// GET /api/analytics/heatmap
router.get('/heatmap', getHeatmapData);

// GET /api/analytics/stats - landing page counters
router.get('/stats', getStats);

module.exports = router;
