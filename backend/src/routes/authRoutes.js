const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/auth/login - Login user & return token + profil
router.post('/login', authController.login);

// GET /api/auth/me - Cek profil user yang sedang login
router.get('/me', authenticateToken, authController.getProfile);

// POST & PUT /api/auth/change-password - Ganti password pengguna (wajib untuk password sementara)
router.post('/change-password', authenticateToken, authController.changePassword);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
