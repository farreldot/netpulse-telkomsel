const { query } = require('../config/db');

/**
 * Fungsi pembantu untuk menghitung label kualitas sinyal berdasarkan parameter RSRP (dBm)
 * Standar RSRP 4G LTE:
 * >= -85 dBm: 'Sangat Baik' (Excellent)
 * >= -95 dBm: 'Baik' (Good)
 * >= -105 dBm: 'Cukup' (Fair)
 * < -105 dBm: 'Buruk' (Poor)
 */
const calculateQualityLabel = (rsrp) => {
  const numRsrp = parseFloat(rsrp);
  if (isNaN(numRsrp)) return 'Tidak Diketahui';

  if (numRsrp >= -85) {
    return 'Sangat Baik';
  } else if (numRsrp >= -95) {
    return 'Baik';
  } else if (numRsrp >= -105) {
    return 'Cukup';
  } else {
    return 'Buruk';
  }
};

/**
 * GET /api/signal-logs
 * Mendapatkan seluruh riwayat pengujian sinyal (dapat diakses admin & mitra)
 * Mendukung filter: ?enb_id=990101 / ?quality_label=Baik / ?tested_by=mitra1
 */
const getAllSignalLogs = async (req, res) => {
  try {
    const { enb_id, quality_label, tested_by, limit = 100, page = 1 } = req.query;
    let sql = 'SELECT * FROM signal_logs WHERE 1=1';
    const params = [];

    if (enb_id) {
      params.push(enb_id.trim());
      sql += ` AND enb_id = $${params.length}`;
    }

    if (quality_label) {
      params.push(quality_label.trim());
      sql += ` AND quality_label = $${params.length}`;
    }

    if (tested_by) {
      params.push(`%${tested_by.trim()}%`);
      sql += ` AND tested_by ILIKE $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    params.push(parsedLimit);
    sql += ` LIMIT $${params.length}`;
    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const result = await query(sql, params);

    // Hitung total data untuk pagination info
    const countSql = 'SELECT COUNT(*) FROM signal_logs';
    const countRes = await query(countSql);
    const totalRecords = parseInt(countRes.rows[0].count, 10);

    return res.status(200).json({
      success: true,
      total: totalRecords,
      page: parsedPage,
      limit: parsedLimit,
      data: result.rows,
    });
  } catch (error) {
    console.error('[SignalLogController.getAllSignalLogs] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil riwayat log sinyal.',
      error: error.message,
    });
  }
};

/**
 * GET /api/signal-logs/:id
 * Mendapatkan detail spesifik log sinyal berdasarkan ID
 */
const getSignalLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM signal_logs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Signal Log dengan ID ${id} tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[SignalLogController.getSignalLogById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail signal log.',
      error: error.message,
    });
  }
};

/**
 * POST /api/signal-logs
 * Menyimpan hasil ekstraksi OCR dan data pengujian sinyal (dapat diakses admin & mitra)
 * Logika otomatis:
 * 1. Cocokkan enb_id ke bts_sites untuk mengisi site_name jika ditemukan.
 * 2. Hitung quality_label otomatis berdasarkan nilai RSRP.
 */
const createSignalLog = async (req, res) => {
  try {
    const {
      enb_id,
      site_name,
      longitude,
      latitude,
      rsrp,
      rsrq,
      snr,
      notes,
      tested_by,
    } = req.body;

    if (
      longitude === undefined ||
      latitude === undefined ||
      rsrp === undefined ||
      rsrq === undefined ||
      snr === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Field longitude, latitude, rsrp, rsrq, dan snr wajib diisi.',
      });
    }

    let finalSiteName = site_name ? site_name.trim() : null;
    const cleanEnbId = enb_id ? enb_id.toString().trim() : null;

    // 1. Otomatis cocokkan enb_id dengan bts_sites jika enb_id diberikan
    if (cleanEnbId) {
      const siteMatch = await query('SELECT site_name FROM bts_sites WHERE enb_id = $1 LIMIT 1', [cleanEnbId]);
      if (siteMatch.rows.length > 0) {
        finalSiteName = siteMatch.rows[0].site_name;
      }
    }

    if (!finalSiteName) {
      finalSiteName = cleanEnbId ? `BTS_${cleanEnbId}` : 'Unknown Site';
    }

    // 2. Hitung quality_label otomatis berdasarkan RSRP
    const qualityLabel = calculateQualityLabel(rsrp);

    // 3. Tentukan tester (dari payload atau pengguna yang sedang login)
    const finalTestedBy =
      tested_by && tested_by.trim() !== ''
        ? tested_by.trim()
        : req.user
        ? req.user.full_name || req.user.username
        : 'Anonim';

    const insertSql = `
      INSERT INTO signal_logs (
        enb_id, site_name, longitude, latitude, rsrp, rsrq, snr, quality_label, notes, tested_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await query(insertSql, [
      cleanEnbId,
      finalSiteName,
      parseFloat(longitude),
      parseFloat(latitude),
      parseFloat(rsrp),
      parseFloat(rsrq),
      parseFloat(snr),
      qualityLabel,
      notes ? notes.trim() : null,
      finalTestedBy,
    ]);

    return res.status(201).json({
      success: true,
      message: 'Hasil pengujian sinyal berhasil disimpan.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[SignalLogController.createSignalLog] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyimpan log sinyal.',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/signal-logs/:id
 * Menghapus data log sinyal (HANYA role admin)
 */
const deleteSignalLog = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM signal_logs WHERE id = $1 RETURNING id, site_name, enb_id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Signal Log dengan ID ${id} tidak ditemukan.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Signal Log ID ${id} (${result.rows[0].site_name || 'No Site'}) berhasil dihapus.`,
      deletedLog: result.rows[0],
    });
  } catch (error) {
    console.error('[SignalLogController.deleteSignalLog] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus log sinyal.',
      error: error.message,
    });
  }
};

module.exports = {
  getAllSignalLogs,
  getSignalLogById,
  createSignalLog,
  deleteSignalLog,
};
