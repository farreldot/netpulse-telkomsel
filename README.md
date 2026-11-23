# NetPulse Log Telkomsel 📡

**NetPulse Log** adalah aplikasi *Progressive Web App* (PWA) berbasis full-stack untuk pemantauan kualitas jaringan (*Drive Test*), pemetaan Base Transceiver Station (BTS) Telkomsel area Semarang & Tembalang, serta ekstraksi otomatis data sinyal dari tangkapan layar aplikasi **G-NetTrack** menggunakan **Tesseract OCR**.

Proyek ini disusun sebagai **Tugas Akhir Praktikum Pemrograman Perangkat Bergerak (PPB)**.

---

## 👨‍💻 Informasi Pengembang
- **Nama**: Farrel Revanza AlHuwaida
- **NIM**: 21120124130075
- **Program Studi**: Teknik Komputer
- **Departemen**: Teknik Sistem Komputer, Fakultas Teknik
- **Institusi**: Universitas Diponegoro (Semarang)
- **Mata Kuliah**: Praktikum Pemrograman Perangkat Bergerak (PPB)

---

## 🔑 Akun Demo Responsi / Pengujian

Aplikasi telah dilengkapi fitur auto-seed dan tombol **Isi Cepat Demo** pada halaman login:

| Role | Username | Password | Hak Akses & Keterangan |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | Akses penuh (Kelola Mitra, Tambah/Edit/Hapus Site BTS, Hapus Log Sinyal) |
| **Mitra Drive Test** | `mitra1` | `mitra123` | Akses terbatas (Lihat Daftar Site, Catat/Scan Log Sinyal, Akses menu Mitra ditolak) |

---

## 🏗️ Arsitektur & Struktur Proyek

```
NetPulse-Telkomsel/
├── backend/                         # Backend REST API (Node.js & Express.js)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # Koneksi PostgreSQL / Supabase & auto-seed data
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login & verifikasi profil
│   │   │   ├── siteController.js    # CRUD master data BTS Telkomsel
│   │   │   ├── signalLogController.js # Pencatatan & perhitungan kualitas sinyal
│   │   │   └── userController.js    # Manajemen akun pengguna & mitra (Admin only)
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # Verifikasi Bearer JWT & otorisasi RBAC (Admin/Mitra)
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Rute /api/auth
│   │   │   ├── siteRoutes.js        # Rute /api/sites
│   │   │   ├── signalLogRoutes.js   # Rute /api/signal-logs
│   │   │   └── userRoutes.js        # Rute /api/users
│   │   └── index.js                 # Entry point Express, CORS (*), routing
│   ├── .env.example                 # Template variabel lingkungan backend
│   ├── package.json                 # Dependensi backend (express, pg, jwt, bcryptjs, dll)
│   ├── schema.sql                   # Skema DDL tabel PostgreSQL
│   ├── test-logic.js                # Unit test logika bisnis & RBAC
│   └── vercel.json                  # Konfigurasi deployment serverless Vercel backend
│
├── frontend/                        # Frontend PWA (React + Vite + Tailwind CSS)
│   ├── public/
│   │   ├── favicon.svg              # Ikon aplikasi logo signal tower Telkomsel
│   │   ├── pwa-192x192.svg          # Ikon PWA maskable 192x192
│   │   └── pwa-512x512.svg          # Ikon PWA maskable 512x512
│   ├── src/
│   │   ├── components/
│   │   │   ├── BottomNav.jsx        # Bottom Navigation Bar (Fixed di bawah, adaptif role)
│   │   │   ├── Header.jsx           # Header Telkomsel, status Online/Offline, tombol Install PWA
│   │   │   └── Layout.jsx           # Layout pembungkus dengan padding aman notch
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # State otentikasi JWT, localStorage, & ProtectedRoute
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Login + tombol cepat demo Admin & Mitra
│   │   │   ├── SitesPage.jsx        # Halaman 1: Daftar BTS Telkomsel (Search, Filter, Tambah/Edit/Hapus)
│   │   │   ├── SiteDetailPage.jsx   # Halaman 2: Detail BTS, peta Google Maps, & riwayat sinyal site
│   │   │   ├── SignalLogsPage.jsx   # Halaman 3: Log Sinyal dengan badge warna kualitas RSRP
│   │   │   ├── SignalLogDetailPage.jsx # Halaman 4: Detail RF (RSRP, RSRQ, SNR, penguji, catatan)
│   │   │   ├── ScanOcrPage.jsx      # Halaman 5: Ekstraksi OCR screenshot G-NetTrack & form koreksi
│   │   │   ├── MitraPage.jsx        # Halaman 6: Kelola akun mitra & admin (Khusus Admin)
│   │   │   └── ProfilePage.jsx      # Halaman 7: Profil, statistik, & Kartu Informasi Pengembang
│   │   ├── services/
│   │   │   └── api.js               # Client REST API dengan injection Bearer Token otomatis
│   │   ├── utils/
│   │   │   └── gnettrackOcr.js      # Modul Canvas pre-processing & Position-Independent Regex OCR
│   │   ├── App.jsx                  # Routing React Router DOM
│   │   ├── index.css                # Konfigurasi Tailwind & safe-area mobile
│   │   └── main.jsx                 # Entry React & pendaftaran Service Worker PWA
│   ├── .env.example                 # Template variabel lingkungan frontend
│   ├── index.html                   # HTML PWA dengan meta theme-color #EC2028
│   ├── package.json                 # Dependensi frontend (react, vite-plugin-pwa, tesseract.js, lucide)
│   ├── test-ocr-parser.js           # Unit test ekstraksi teks regex OCR
│   ├── vercel.json                  # Rewrite rule SPA anti-404 Vercel frontend
│   └── vite.config.js               # Konfigurasi Vite & VitePWA caching strategy
└── README.md                        # Dokumentasi utama proyek
```

---

## 📊 Parameter Radio Frequency (RF) & Standar Kualitas

Sistem secara otomatis mengklasifikasikan kualitas sinyal berdasarkan nilai **RSRP** (*Reference Signal Received Power*) sesuai standar industri 4G LTE:

| Level Kualitas | Ambang Batas RSRP | Warna Badge | Keterangan Kondisi Jaringan |
|---|---|---|---|
| **Sangat Baik** | $\ge -85\text{ dBm}$ | 🟢 Hijau Emerald | Sinyal sangat kuat, dekat antena pemancar, throughput optimal |
| **Baik** | $-86\text{ s.d. } -95\text{ dBm}$ | 🔵 Biru | Sinyal stabil, streaming video dan unduhan data lancar |
| **Cukup** | $-96\text{ s.d. } -105\text{ dBm}$ | 🟡 Kuning / Amber | Sinyal memadai di luar ruangan, kecepatan berfluktuasi |
| **Buruk** | $< -105\text{ dBm}$ | 🔴 Merah | Sinyal lemah (*edge of cell*), potensi *call drop* atau *buffering* |

---

## 🔍 Modul OCR G-NetTrack (`gnettrackOcr.js`)

Modul OCR dirancang khusus untuk memproses tangkapan layar aplikasi **G-NetTrack** dengan prinsip:
1. **Position-Independent Parsing**: Tidak menggunakan pemotongan koordinat tetap (*bounding box*), melainkan memindai teks keseluruhan gambar agar kompatibel dengan berbagai rasio layar dan posisi *scroll*.
2. **Pra-pemrosesan Canvas**: Gambar diperkecil secara proporsional jika lebar $> 1280\text{ px}$, diubah ke *grayscale* standar ($0.299R + 0.587G + 0.114B$), serta ditingkatkan kontrasnya ($+55\text{ level}$) sehingga teks angka kecil terbaca tajam dalam waktu singkat ($\sim 1\text{--}2\text{ detik}$).
3. **Ekstraksi 6 Parameter Wajib**:
   - `enb_id` (Base Station ID)
   - `latitude` (Garis Lintang)
   - `longitude` (Garis Bujur)
   - `rsrp` (dBm)
   - `rsrq` (dB)
   - `snr` (dB)
4. **Toleransi Kesalahan Baca**: Mengoreksi tanda minus panjang (`—`, `–`, `−` $\rightarrow$ `-`), koma desimal (`-7,05` $\rightarrow$ `-7.05`), serta otomatisasi tanda negatif koordinat wilayah Indonesia.

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

### 1. Menjalankan Backend API
```bash
# Masuk ke folder backend
cd backend

# Instalasi dependensi
npm install

# Buat file konfigurasi lingkungan dari template
cp .env.example .env

# Jalankan unit test logika backend
npm test

# Jalankan server API (Development mode dengan nodemon)
npm run dev
# Server berjalan di http://localhost:5000
```

### 2. Menjalankan Frontend PWA
```bash
# Buka terminal baru dan masuk ke folder frontend
cd frontend

# Instalasi dependensi
npm install

# Buat file konfigurasi lingkungan dari template
cp .env.example .env

# Jalankan unit test ekstraksi OCR
npm run test:ocr

# Jalankan frontend development server
npm run dev
# Aplikasi terbuka di http://localhost:5173
```

---

## 🌐 Panduan Deployment ke Vercel

Kedua folder (`backend/` dan `frontend/`) telah dilengkapi file konfigurasi `vercel.json` siap pakai.

### A. Deploy Backend ke Vercel
1. Pastikan Anda memiliki database PostgreSQL cloud (misal **Supabase** atau **Neon**).
2. Di dashboard Vercel, pilih **Add New Project** dan arahkan ke root folder `backend`.
3. Konfigurasi Environment Variables di Vercel:
   - `DATABASE_URL`: URI koneksi PostgreSQL / Supabase Anda (misal `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require`)
   - `JWT_SECRET`: Kunci rahasia acak untuk token JWT (misal `netpulse_secret_key_2026`)
   - `JWT_EXPIRES_IN`: `24h`
   - `NODE_ENV`: `production`
4. Klik **Deploy**. Salin URL backend yang dihasilkan (contoh: `https://netpulse-backend.vercel.app`).

### B. Deploy Frontend PWA ke Vercel
1. Di dashboard Vercel, pilih **Add New Project** dan arahkan ke root folder `frontend`.
2. Konfigurasi Build & Output Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Konfigurasi Environment Variables:
   - `VITE_API_BASE_URL`: URL backend yang telah di-deploy (contoh: `https://netpulse-backend.vercel.app/api`)
4. Klik **Deploy**. Aplikasi PWA Anda siap digunakan di smartphone maupun desktop dengan dukungan *offline mode* dan *PWA install prompt*.

---

## 📋 Matriks Role-Based Access Control (RBAC)

| Fitur / Halaman | Endpoint API | Role Admin | Role Mitra |
|---|---|:---:|:---:|
| Login & Profil | `POST /api/auth/login`, `GET /api/auth/me` | ✅ | ✅ |
| Lihat Daftar BTS Sites | `GET /api/sites` | ✅ | ✅ |
| Detail BTS Site | `GET /api/sites/:id` | ✅ | ✅ |
| Tambah BTS Site Baru | `POST /api/sites` | ✅ | ❌ *(HTTP 403)* |
| Edit & Hapus BTS Site | `PUT /api/sites/:id`, `DELETE /api/sites/:id` | ✅ | ❌ *(HTTP 403)* |
| Lihat Riwayat Log Sinyal | `GET /api/signal-logs` | ✅ | ✅ |
| Detail Log Sinyal | `GET /api/signal-logs/:id` | ✅ | ✅ |
| Simpan Hasil Ekstraksi OCR | `POST /api/signal-logs` | ✅ | ✅ |
| Hapus Log Sinyal | `DELETE /api/signal-logs/:id` | ✅ | ❌ *(HTTP 403)* |
| Akses Menu Kelola Mitra | Halaman `/mitra` | ✅ | ❌ *(Navigasi disembunyikan)* |
| Tambah / Edit / Hapus Akun Mitra | `/api/users` (GET, POST, PUT, DELETE) | ✅ | ❌ *(HTTP 403)* |
