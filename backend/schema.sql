-- ==============================================================================
-- Schema SQL untuk NetPulse Telkomsel Backend
-- Database: PostgreSQL / Supabase
-- ==============================================================================

-- 1. Tabel users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'mitra')),
    mitra_unit VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk pencarian username lebih cepat
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 2. Tabel bts_sites
CREATE TABLE IF NOT EXISTS bts_sites (
    id SERIAL PRIMARY KEY,
    enb_id VARCHAR(50) UNIQUE NOT NULL,
    site_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    frequency_band VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk pencarian eNB ID
CREATE INDEX IF NOT EXISTS idx_bts_sites_enb_id ON bts_sites(enb_id);

-- 3. Tabel signal_logs
CREATE TABLE IF NOT EXISTS signal_logs (
    id SERIAL PRIMARY KEY,
    enb_id VARCHAR(50),
    site_name VARCHAR(100),
    longitude NUMERIC(10, 6) NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    rsrp NUMERIC(6, 2) NOT NULL,
    rsrq NUMERIC(6, 2) NOT NULL,
    snr NUMERIC(6, 2) NOT NULL,
    quality_label VARCHAR(50),
    notes TEXT,
    tested_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk eNB ID dan filter waktu pengujian
CREATE INDEX IF NOT EXISTS idx_signal_logs_enb_id ON signal_logs(enb_id);
CREATE INDEX IF NOT EXISTS idx_signal_logs_created_at ON signal_logs(created_at DESC);
