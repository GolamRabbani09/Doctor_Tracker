const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public route: login
router.post('/login', login);

// Protected route: get authenticated user info
router.get('/me', protect, getMe);

module.exports = router;
