const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

/**
 * GET /api/users
 * Mendapatkan daftar seluruh pengguna (khusus admin, dapat difilter per role: ?role=mitra)
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let sql = `
      SELECT id, username, full_name, role, mitra_unit, is_active, created_at, updated_at 
      FROM users 
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      params.push(role);
      sql += ` AND role = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (username ILIKE $${params.length} OR full_name ILIKE $${params.length} OR mitra_unit ILIKE $${params.length})`;
    }

    sql += ' ORDER BY id ASC';

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('[UserController.getAllUsers] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pengguna.',
      error: error.message,
    });
  }
};

/**
 * GET /api/users/:id
 * Mendapatkan detail pengguna berdasarkan ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, username, full_name, role, mitra_unit, is_active, created_at, updated_at 
       FROM users 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Pengguna dengan ID ${id} tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[UserController.getUserById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail pengguna.',
      error: error.message,
    });
  }
};

/**
 * POST /api/users
 * Menambahkan pengguna baru (khusus admin mengelola mitra/admin baru)
 */
const createUser = async (req, res) => {
  try {
    const { username, password, full_name, fullName, role, mitra_unit, mitraUnit, is_active, isActive } = req.body;

    const fullNameVal = full_name || fullName;
    const mitraUnitVal = mitra_unit || mitraUnit || 'Mitra Drive Test';

    if (!username || !password || !fullNameVal) {
      return res.status(400).json({
        success: false,
        message: 'Field username, password, dan full_name wajib diisi.',
      });
    }

    // Normalisasi role agar selalu lolos constraint CHECK (role IN ('admin', 'mitra'))
    const normalizedRole = String(role || '').toLowerCase().includes('admin') ? 'admin' : 'mitra';

    // Normalisasi is_active menjadi boolean murni
    const rawIsActive = is_active !== undefined ? is_active : isActive;
    let normalizedIsActive = true;
    if (
      rawIsActive === false ||
      rawIsActive === 'false' ||
      String(rawIsActive).toLowerCase() === 'nonaktif'
    ) {
      normalizedIsActive = false;
    }

    // Periksa apakah username sudah dipakai
    const existing = await query('SELECT id FROM users WHERE username = $1', [username.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan, silakan pilih username lain.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertSql = `
      INSERT INTO users (username, password, full_name, role, mitra_unit, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, full_name, role, mitra_unit, is_active, created_at, updated_at
    `;
    const result = await query(insertSql, [
      username.trim(),
      hashedPassword,
      fullNameVal.trim(),
      normalizedRole,
      mitraUnitVal,
      normalizedIsActive,
    ]);

    return res.status(201).json({
      success: true,
      message: 'Pengguna baru berhasil dibuat.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[UserController.createUser] Error:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan, silakan pilih username lain.',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan saat menambahkan pengguna.',
      error: error.message,
    });
  }
};

/**
 * PUT /api/users/:id
 * Mengupdate data pengguna (khusus admin)
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, full_name, fullName, role, mitra_unit, mitraUnit, is_active, isActive } = req.body;

    // Periksa apakah user ada
    const checkUser = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Pengguna dengan ID ${id} tidak ditemukan.`,
      });
    }

    const currentUser = checkUser.rows[0];

    // Jika username diubah, pastikan tidak duplikat dengan akun lain
    if (username && username.trim() !== currentUser.username) {
      const duplicateCheck = await query('SELECT id FROM users WHERE username = $1 AND id != $2', [
        username.trim(),
        id,
      ]);
      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan, silakan pilih username lain.',
        });
      }
    }

    // Fleksibel snake_case atau camelCase
    const fullNameVal = full_name || fullName;
    const newFullName = fullNameVal ? fullNameVal.trim() : currentUser.full_name;
    const newUsername = username ? username.trim() : currentUser.username;

    // Normalisasi role
    let newRole = currentUser.role;
    if (role !== undefined) {
      newRole = String(role).toLowerCase().includes('admin') ? 'admin' : 'mitra';
    }

    // Normalisasi mitra_unit
    let newMitraUnit = currentUser.mitra_unit;
    const rawMitraUnit = mitra_unit !== undefined ? mitra_unit : mitraUnit;
    if (rawMitraUnit !== undefined) {
      newMitraUnit = rawMitraUnit || 'Mitra Drive Test';
    }

    // Normalisasi is_active
    let newIsActive = currentUser.is_active;
    const rawIsActive = is_active !== undefined ? is_active : isActive;
    if (rawIsActive !== undefined) {
      if (
        rawIsActive === false ||
        rawIsActive === 'false' ||
        String(rawIsActive).toLowerCase() === 'nonaktif'
      ) {
        newIsActive = false;
      } else {
        newIsActive = true;
      }
    }

    let newPassword = currentUser.password;
    if (password && password.trim() !== '') {
      newPassword = await bcrypt.hash(password, 10);
    }

    const updateSql = `
      UPDATE users 
      SET username = $1, password = $2, full_name = $3, role = $4, mitra_unit = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, username, full_name, role, mitra_unit, is_active, created_at, updated_at
    `;

    const result = await query(updateSql, [
      newUsername,
      newPassword,
      newFullName,
      newRole,
      newMitraUnit,
      newIsActive,
      id,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diperbarui.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[UserController.updateUser] Error:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan, silakan pilih username lain.',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan saat memperbarui pengguna.',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/users/:id
 * Menghapus akun pengguna (khusus admin)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cegah admin menghapus akunnya sendiri yang sedang aktif
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan.',
      });
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id, username, full_name', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Pengguna dengan ID ${id} tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Pengguna '${result.rows[0].username}' berhasil dihapus.`,
      deletedUser: result.rows[0],
    });
  } catch (error) {
    console.error('[UserController.deleteUser] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus pengguna.',
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
