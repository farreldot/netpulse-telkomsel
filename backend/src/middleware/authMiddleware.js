const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi JWT token dari header Authorization
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token otentikasi (Bearer token) tidak ditemukan.',
    });
  }

  const secret = process.env.JWT_SECRET || 'netpulse_secret_key_default_change_in_production';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Token otentikasi tidak valid atau telah kedaluwarsa.',
        error: err.message,
      });
    }

    // Pasang payload token ke req.user
    req.user = decoded;
    next();
  });
};

/**
 * Middleware untuk otorisasi berdasarkan role pengguna ('admin' atau 'mitra')
 * @param  {...string} roles - Daftar role yang diizinkan (misal: 'admin')
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna belum terotentikasi.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak (HTTP 403 Forbidden). Tindakan ini hanya dapat diakses oleh role: [${roles.join(', ')}].`,
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};
