const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Semua rute BTS Sites memerlukan autentikasi login (token JWT)
router.use(authenticateToken);

// GET /api/sites - Dapat diakses oleh 'admin' dan 'mitra'
router.get('/', siteController.getAllSites);

// GET /api/sites/:id - Dapat diakses oleh 'admin' dan 'mitra'
router.get('/:id', siteController.getSiteById);

// POST /api/sites - HANYA dapat diakses role 'admin' (HTTP 403 untuk 'mitra')
router.post('/', authorizeRole('admin'), siteController.createSite);

// PUT /api/sites/:id - HANYA dapat diakses role 'admin' (HTTP 403 untuk 'mitra')
router.put('/:id', authorizeRole('admin'), siteController.updateSite);

// DELETE /api/sites/:id - HANYA dapat diakses role 'admin' (HTTP 403 untuk 'mitra')
router.delete('/:id', authorizeRole('admin'), siteController.deleteSite);

module.exports = router;
