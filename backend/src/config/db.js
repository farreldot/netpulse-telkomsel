const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Konfigurasi koneksi PostgreSQL / Supabase
const connectionString = process.env.DATABASE_URL;

const isSupabaseOrRemote =
  connectionString &&
  (connectionString.includes('supabase') ||
    connectionString.includes('sslmode=require') ||
    process.env.NODE_ENV === 'production');

const pool = new Pool({
  connectionString: connectionString || undefined,
  user: process.env.PGUSER || undefined,
  host: process.env.PGHOST || undefined,
  database: process.env.PGDATABASE || undefined,
  password: process.env.PGPASSWORD || undefined,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
  ssl: isSupabaseOrRemote ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

// Helper query untuk kemudahan eksekusi parameterized queries
const query = async (text, params) => {
  return pool.query(text, params);
};

// Inisialisasi Supabase JS Client jika URL & Key tersedia
let supabase = null;
if (process.env.SUPABASE_URL && (process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
  );
}

// Auto-seed data saat pertama kali server dijalankan (jika tabel kosong)
const initDb = async () => {
  try {
    // 1. Eksekusi skema dari file schema.sql jika tersedia
    const schemaPath = path.join(__dirname, '../../schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('[DB] Skema database berhasil diverifikasi/dibuat.');
    }

    // Pastikan kolom must_change_password tersedia pada tabel users
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;');

    // 2. Auto-seed Users
    const usersCountRes = await pool.query('SELECT COUNT(*) FROM users');
    const usersCount = parseInt(usersCountRes.rows[0].count, 10);
    if (usersCount === 0) {
      console.log('[DB] Tabel users kosong, menjalankan auto-seed user default...');
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const mitraPasswordHash = await bcrypt.hash('mitra123', 10);

      const userSeedQuery = `
        INSERT INTO users (username, password, full_name, role, mitra_unit, is_active)
        VALUES 
          ($1, $2, $3, $4, $5, $6),
          ($7, $8, $9, $10, $11, $12)
      `;
      await pool.query(userSeedQuery, [
        'admin',
        adminPasswordHash,
        'Administrator Telkomsel',
        'admin',
        'Telkomsel Regional Jateng-DIY',
        true,
        'mitra1',
        mitraPasswordHash,
        'Mitra Drive Test 1',
        'mitra',
        'Mitra Drive Test Semarang',
        true,
      ]);
      console.log('[DB] Berhasil seed 2 user default: admin & mitra1.');
    }

    // 3. Auto-seed BTS Sites (8 data dummy BTS Telkomsel Semarang & Tembalang)
    const sitesCountRes = await pool.query('SELECT COUNT(*) FROM bts_sites');
    const sitesCount = parseInt(sitesCountRes.rows[0].count, 10);
    if (sitesCount === 0) {
      console.log('[DB] Tabel bts_sites kosong, menjalankan auto-seed 8 dummy BTS Semarang & Tembalang...');
      const siteSeeds = [
        ['990101', 'TSEL_UNDIP_TEMBALANG', 'Jl. Prof. Soedarto No. 1, Tembalang, Semarang', -7.050300, 110.438500, 'L1800 / L2100', 'Active'],
        ['990102', 'TSEL_BANJARSARI_TEMBALANG', 'Jl. Banjarsari Selatan, Tembalang, Semarang', -7.058200, 110.442100, 'L900 / L1800 / L2100', 'Active'],
        ['990103', 'TSEL_SIMPANG_LIMA_SMG', 'Kawasan Simpang Lima, Semarang Tengah', -6.990400, 110.422900, 'L1800 / L2100 / L2300', 'Active'],
        ['990104', 'TSEL_PANDANARAN_SMG', 'Jl. Pandanaran No. 88, Mugassari, Semarang', -6.988100, 110.415000, 'L1800 / L2100', 'Active'],
        ['990105', 'TSEL_NGESREP_TIMUR', 'Jl. Ngesrep Timur V, Sumurboto, Banyumanik', -7.042500, 110.428900, 'L1800 / L2100', 'Active'],
        ['990106', 'TSEL_KOTA_LAMA_SMG', 'Kawasan Kota Lama, Jl. Letjen Suprapto, Semarang', -6.968200, 110.427800, 'L900 / L1800', 'Active'],
        ['990107', 'TSEL_POLINES_TEMBALANG', 'Jl. Prof. Soedarto (Kompleks Polines), Tembalang', -7.054500, 110.434200, 'L1800 / L2300', 'Maintenance'],
        ['990108', 'TSEL_SETIABUDI_BANYUMANIK', 'Jl. Dr. Setiabudi No. 120, Banyumanik, Semarang', -7.062000, 110.421500, 'L1800 / L2100', 'Active'],
      ];

      for (const s of siteSeeds) {
        await pool.query(
          `INSERT INTO bts_sites (enb_id, site_name, address, latitude, longitude, frequency_band, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          s
        );
      }
      console.log('[DB] Berhasil seed 8 dummy BTS sites Telkomsel Semarang & Tembalang.');
    }

    // 4. Auto-seed Signal Logs (3 data dummy log pengujian awal)
    const logsCountRes = await pool.query('SELECT COUNT(*) FROM signal_logs');
    const logsCount = parseInt(logsCountRes.rows[0].count, 10);
    if (logsCount === 0) {
      console.log('[DB] Tabel signal_logs kosong, menjalankan auto-seed 3 dummy signal logs...');
      const logSeeds = [
        [
          '990101',
          'TSEL_UNDIP_TEMBALANG',
          110.438500,
          -7.050300,
          -82.00,
          -8.50,
          18.20,
          'Sangat Baik',
          'Pengujian sinyal area gerbang utama UNDIP Tembalang',
          'mitra1',
        ],
        [
          '990102',
          'TSEL_BANJARSARI_TEMBALANG',
          110.442100,
          -7.058200,
          -91.50,
          -11.00,
          12.40,
          'Baik',
          'Throughput stabil, kondisi cuaca cerah',
          'mitra1',
        ],
        [
          '990105',
          'TSEL_NGESREP_TIMUR',
          110.428900,
          -7.042500,
          -108.00,
          -16.50,
          3.10,
          'Buruk',
          'Sinyal terhalang ruko bertingkat dan kontur perbukitan',
          'admin',
        ],
      ];

      for (const l of logSeeds) {
        await pool.query(
          `INSERT INTO signal_logs (enb_id, site_name, longitude, latitude, rsrp, rsrq, snr, quality_label, notes, tested_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          l
        );
      }
      console.log('[DB] Berhasil seed 3 dummy signal logs awal.');
    }

    console.log('[DB] Inisialisasi database dan auto-seed selesai.');
    return true;
  } catch (error) {
    console.warn('[DB] Perhatian: Gagal melakukan inisialisasi database PostgreSQL / Supabase.');
    console.warn(`[DB] Pesan kesalahan: ${error.message}`);
    console.warn('[DB] Pastikan variabel lingkungan DATABASE_URL pada file .env telah diatur dengan benar.');
    return false;
  }
};

module.exports = {
  pool,
  query,
  supabase,
  initDb,
};
