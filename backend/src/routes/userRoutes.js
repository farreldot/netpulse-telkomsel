const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Semua rute user hanya boleh diakses oleh akun dengan role 'admin'
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// GET /api/users - Daftar user
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Detail user
router.get('/:id', userController.getUserById);

// POST /api/users - Buat user baru (kelola akun mitra)
router.post('/', userController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Hapus user
router.delete('/:id', userController.deleteUser);

module.exports = router;
