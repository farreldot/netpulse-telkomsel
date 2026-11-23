const { query } = require('../config/db');

/**
 * GET /api/sites
 * Mendapatkan seluruh daftar BTS sites (dapat diakses oleh admin & mitra)
 * Mendukung filter: ?status=Active / ?search=Tembalang
 */
const getAllSites = async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = 'SELECT * FROM bts_sites WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (enb_id ILIKE $${params.length} OR site_name ILIKE $${params.length} OR address ILIKE $${params.length})`;
    }

    sql += ' ORDER BY id ASC';

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('[SiteController.getAllSites] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar BTS sites.',
      error: error.message,
    });
  }
};

/**
 * GET /api/sites/:id
 * Mendapatkan detail spesifik BTS site berdasarkan ID
 */
const getSiteById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM bts_sites WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `BTS Site dengan ID ${id} tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[SiteController.getSiteById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail BTS site.',
      error: error.message,
    });
  }
};

/**
 * POST /api/sites
 * Menambahkan data BTS Site baru (HANYA role admin)
 */
const createSite = async (req, res) => {
  try {
    const { enb_id, site_name, address, latitude, longitude, frequency_band, status = 'Active' } = req.body;

    if (!enb_id || !site_name || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Field enb_id, site_name, address, latitude, dan longitude wajib diisi.',
      });
    }

    // Periksa apakah enb_id sudah terdaftar
    const checkEnb = await query('SELECT id FROM bts_sites WHERE enb_id = $1', [enb_id.trim()]);
    if (checkEnb.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `eNB ID '${enb_id}' sudah terdaftar pada sistem.`,
      });
    }

    const insertSql = `
      INSERT INTO bts_sites (enb_id, site_name, address, latitude, longitude, frequency_band, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(insertSql, [
      enb_id.trim(),
      site_name.trim(),
      address.trim(),
      parseFloat(latitude),
      parseFloat(longitude),
      frequency_band || null,
      status || 'Active',
    ]);

    return res.status(201).json({
      success: true,
      message: 'BTS Site baru berhasil ditambahkan.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[SiteController.createSite] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan BTS site.',
      error: error.message,
    });
  }
};

/**
 * PUT /api/sites/:id
 * Mengupdate data BTS Site (HANYA role admin)
 */
const updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    const { enb_id, site_name, address, latitude, longitude, frequency_band, status } = req.body;

    // Periksa apakah site ada
    const checkSite = await query('SELECT * FROM bts_sites WHERE id = $1', [id]);
    if (checkSite.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `BTS Site dengan ID ${id} tidak ditemukan.`,
      });
    }

    const currentSite = checkSite.rows[0];

    // Cek keunikan enb_id jika diubah
    if (enb_id && enb_id.trim() !== currentSite.enb_id) {
      const duplicateCheck = await query('SELECT id FROM bts_sites WHERE enb_id = $1 AND id != $2', [
        enb_id.trim(),
        id,
      ]);
      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `eNB ID '${enb_id}' sudah digunakan oleh BTS Site lain.`,
        });
      }
    }

    const newEnbId = enb_id ? enb_id.trim() : currentSite.enb_id;
    const newSiteName = site_name ? site_name.trim() : currentSite.site_name;
    const newAddress = address ? address.trim() : currentSite.address;
    const newLatitude = latitude !== undefined ? parseFloat(latitude) : currentSite.latitude;
    const newLongitude = longitude !== undefined ? parseFloat(longitude) : currentSite.longitude;
    const newFrequencyBand = frequency_band !== undefined ? frequency_band : currentSite.frequency_band;
    const newStatus = status || currentSite.status;

    const updateSql = `
      UPDATE bts_sites 
      SET enb_id = $1, site_name = $2, address = $3, latitude = $4, longitude = $5, frequency_band = $6, status = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const result = await query(updateSql, [
      newEnbId,
      newSiteName,
      newAddress,
      newLatitude,
      newLongitude,
      newFrequencyBand,
      newStatus,
      id,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Data BTS Site berhasil diperbarui.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[SiteController.updateSite] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui BTS site.',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/sites/:id
 * Menghapus BTS Site (HANYA role admin)
 */
const deleteSite = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM bts_sites WHERE id = $1 RETURNING id, enb_id, site_name', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `BTS Site dengan ID ${id} tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `BTS Site '${result.rows[0].site_name}' (${result.rows[0].enb_id}) berhasil dihapus.`,
      deletedSite: result.rows[0],
    });
  } catch (error) {
    console.error('[SiteController.deleteSite] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus BTS site.',
      error: error.message,
    });
  }
};

module.exports = {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
};
