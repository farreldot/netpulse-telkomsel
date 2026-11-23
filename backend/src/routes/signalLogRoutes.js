const express = require('express');
const router = express.Router();
const signalLogController = require('../controllers/signalLogController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Semua rute Signal Logs memerlukan autentikasi login
router.use(authenticateToken);

// GET /api/signal-logs - Dapat diakses oleh 'admin' dan 'mitra'
router.get('/', signalLogController.getAllSignalLogs);

// GET /api/signal-logs/:id - Dapat diakses oleh 'admin' dan 'mitra'
router.get('/:id', signalLogController.getSignalLogById);

// POST /api/signal-logs - Dapat diakses oleh 'admin' dan 'mitra' (untuk simpan hasil ekstraksi OCR)
router.post('/', signalLogController.createSignalLog);

// DELETE /api/signal-logs/:id - KHUSUS role 'admin' (HTTP 403 untuk 'mitra')
router.delete('/:id', authorizeRole('admin'), signalLogController.deleteSignalLog);

module.exports = router;
