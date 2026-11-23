const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/auth/login - Login user & return token + profil
router.post('/login', authController.login);

// GET /api/auth/me - Cek profil user yang sedang login
router.get('/me', authenticateToken, authController.getProfile);

module.exports = router;
