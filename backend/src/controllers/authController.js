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
      `SELECT id, username, password, full_name, role, mitra_unit, is_active, must_change_password 
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
    const expiresIn = process.env.JWT_EXPIRES_IN || '2h';

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
        must_change_password: Boolean(user.must_change_password),
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
      `SELECT id, username, full_name, role, mitra_unit, is_active, must_change_password, created_at, updated_at 
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

    const userData = {
      ...result.rows[0],
      must_change_password: Boolean(result.rows[0].must_change_password),
    };

    return res.status(200).json({
      success: true,
      data: userData,
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

/**
 * POST /api/auth/change-password atau PUT /api/auth/change-password
 * Mengganti password pengguna (wajib saat login pertama kali jika akun mitra baru)
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword, current_password, new_password } = req.body;

    const oldPass = oldPassword || current_password;
    const newPass = newPassword || new_password;

    if (!oldPass || !newPass) {
      return res.status(400).json({
        success: false,
        message: 'Password sementara dan password baru wajib diisi.',
      });
    }

    if (newPass.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal harus terdiri dari 6 karakter.',
      });
    }

    if (oldPass === newPass) {
      return res.status(400).json({
        success: false,
        message: 'Password baru tidak boleh sama dengan password sementara/lama.',
      });
    }

    // Ambil user dari database
    const userResult = await query(
      `SELECT id, username, password, full_name, role, mitra_unit, is_active, must_change_password 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    const currentUser = userResult.rows[0];

    // Verifikasi password lama / sementara
    const isOldValid = await bcrypt.compare(oldPass, currentUser.password);
    if (!isOldValid) {
      return res.status(400).json({
        success: false,
        message: 'Password sementara yang Anda masukkan salah.',
      });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPass, 10);

    // Update password dan set must_change_password = FALSE
    const updateResult = await query(
      `UPDATE users 
       SET password = $1, must_change_password = FALSE, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, username, full_name, role, mitra_unit, is_active, must_change_password, updated_at`,
      [hashedPassword, userId]
    );

    const updatedUser = updateResult.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diperbarui.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        full_name: updatedUser.full_name,
        role: updatedUser.role,
        mitra_unit: updatedUser.mitra_unit,
        must_change_password: false,
      },
    });
  } catch (error) {
    console.error('[AuthController.changePassword] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server saat mengubah password.',
      error: error.message,
    });
  }
};

module.exports = {
  login,
  getProfile,
  changePassword,
};
