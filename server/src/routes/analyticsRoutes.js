const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Protect all analytics routes
router.use(protect);

router.get('/dashboard', getDashboardAnalytics);

module.exports = router;
