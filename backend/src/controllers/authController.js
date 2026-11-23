const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * POST /api/auth/login
 * Validasi user aktif & kembalikan JWT token + data profil (id, username, full_name, role, mitra_unit)
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.',
      });
    }

    // Cari user berdasarkan username
    const result = await query(
      `SELECT id, username, password, full_name, role, mitra_unit, is_active 
       FROM users 
       WHERE username = $1 
       LIMIT 1`,
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.',
      });
    }

    const user = result.rows[0];

    // Validasi apakah user aktif
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda dinonaktifkan. Silakan hubungi Administrator.',
      });
    }

    // Bandingkan password hash bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.',
      });
    }

    // Siapkan payload JWT
    const payload = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      mitra_unit: user.mitra_unit,
    };

    const secret = process.env.JWT_SECRET || 'netpulse_secret_key_default_change_in_production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(payload, secret, { expiresIn });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        mitra_unit: user.mitra_unit,
      },
    });
  } catch (error) {
    console.error('[AuthController.login] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat proses login.',
      error: error.message,
    });
  }
};

/**
 * GET /api/auth/me
 * Mengambil informasi user login yang sedang aktif berdasarkan token
 */
const getProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, username, full_name, role, mitra_unit, is_active, created_at, updated_at 
       FROM users 
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[AuthController.getProfile] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat mengambil profil pengguna.',
      error: error.message,
    });
  }
};

module.exports = {
  login,
  getProfile,
};
