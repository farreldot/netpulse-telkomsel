# NetPulse Telkomsel - Backend REST API

Backend REST API untuk aplikasi **NetPulse Telkomsel** (Drive Test & Pemantauan Sinyal BTS Area Semarang & Tembalang) yang dibangun dengan Node.js, Express.js, PostgreSQL / Supabase, JWT Authentication, dan Role-Based Access Control (RBAC).

---

## 📁 Struktur Direktori Modular

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                    # Konfigurasi koneksi PostgreSQL/Supabase & fungsi auto-seed
│   ├── controllers/
│   │   ├── authController.js        # Controller login & profil
│   │   ├── userController.js        # Controller kelola pengguna (Admin only)
│   │   ├── siteController.js        # Controller master data BTS Sites
│   │   └── signalLogController.js   # Controller pencatatan log hasil drive test & OCR sinyal
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verify & RBAC role authorization (admin / mitra)
│   ├── routes/
│   │   ├── authRoutes.js            # Rute /api/auth
│   │   ├── userRoutes.js            # Rute /api/users
│   │   ├── siteRoutes.js            # Rute /api/sites
│   │   └── signalLogRoutes.js       # Rute /api/signal-logs
│   └── index.js                     # Entry point Express.js, CORS & routing
├── .env.example                     # Contoh template konfigurasi environment
├── .gitignore                       # Git ignore file
├── package.json                     # Dependencies & scripts
├── schema.sql                       # Definisi DDL PostgreSQL
├── test-logic.js                    # Unit test business logic & middleware
└── vercel.json                      # Konfigurasi Serverless deployment Vercel
```

---

## 🛠️ Instalasi & Menjalankan Server

1. **Instalasi Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Pengaturan File Environment:**
   Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Atur koneksi PostgreSQL atau Supabase pada `DATABASE_URL`:
   - **Koneksi Supabase**:
     ```env
     DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - **Koneksi PostgreSQL Lokal**:
     ```env
     DATABASE_URL=postgresql://postgres:postgres@localhost:5432/netpulse_telkomsel
     ```

3. **Menjalankan Server:**
   - Mode Development (Auto-reload):
     ```bash
     npm run dev
     ```
   - Mode Production:
     ```bash
     npm start
     ```
   - Menjalankan Test Logika:
     ```bash
     npm test
     ```

---

## 🗄️ Skema Database & Fitur Auto-Seed

Saat server pertama kali dijalankan dan terhubung ke database, sistem akan secara otomatis memverifikasi tabel dan menjalankan **auto-seed** jika tabel masih kosong:

### 1. Tabel `users`
| Kolom | Tipe Data | Deskripsi |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | ID unik pengguna |
| `username` | VARCHAR(50) UNIQUE | Username untuk login |
| `password` | VARCHAR(255) | Hash password menggunakan bcrypt |
| `full_name` | VARCHAR(100) | Nama lengkap pengguna |
| `role` | VARCHAR(20) | Role: `'admin'` atau `'mitra'` |
| `mitra_unit` | VARCHAR(150) | Unit kerja mitra / regional |
| `is_active` | BOOLEAN | Status aktif pengguna (default true) |
| `created_at` | TIMESTAMP | Waktu pembuatan |
| `updated_at` | TIMESTAMP | Waktu perubahan |

**Akun Default Hasil Auto-Seed:**
- **Admin**:
  - Username: `admin`
  - Password: `admin123`
  - Role: `admin`
  - Mitra Unit: `Telkomsel Regional Jateng-DIY`
- **Mitra**:
  - Username: `mitra1`
  - Password: `mitra123`
  - Role: `mitra`
  - Mitra Unit: `Mitra Drive Test Semarang`

### 2. Tabel `bts_sites`
Menyimpan data master site BTS Telkomsel. Auto-seed menyertakan **8 data dummy BTS area Semarang & Tembalang** (fiktif 990101 s.d. 990108):
1. `990101` - TSEL_UNDIP_TEMBALANG
2. `990102` - TSEL_BANJARSARI_TEMBALANG
3. `990103` - TSEL_SIMPANG_LIMA_SMG
4. `990104` - TSEL_PANDANARAN_SMG
5. `990105` - TSEL_NGESREP_TIMUR
6. `990106` - TSEL_KOTA_LAMA_SMG
7. `990107` - TSEL_POLINES_TEMBALANG (Status: Maintenance)
8. `990108` - TSEL_SETIABUDI_BANYUMANIK

### 3. Tabel `signal_logs`
Menyimpan log hasil uji drive test sinyal dan hasil ekstraksi OCR:
- Auto-seed memuat 3 data awal log sinyal.
- Pada `POST /api/signal-logs`, sistem secara **otomatis**:
  - Mencocokkan `enb_id` dengan tabel `bts_sites` untuk mengisi nama site (`site_name`).
  - Menghitung `quality_label` otomatis berdasarkan nilai `rsrp`:
    - RSRP $\ge -85\text{ dBm}$: **Sangat Baik**
    - RSRP $\ge -95\text{ dBm}$: **Baik**
    - RSRP $\ge -105\text{ dBm}$: **Cukup**
    - RSRP $< -105\text{ dBm}$: **Buruk**

---

## 🚀 Daftar Endpoint REST API

Semua request yang membutuhkan otentikasi wajib menyertakan header:
`Authorization: Bearer <token_jwt>`

### 1. Autentikasi (`/api/auth`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/login` | Publik | Login & mendapatkan JWT token + profil |
| `GET` | `/api/auth/me` | Admin & Mitra | Mengambil profil user yang sedang login |

#### Contoh Request Login:
```json
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Contoh Response:
```json
{
  "success": true,
  "message": "Login berhasil.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Administrator Telkomsel",
    "role": "admin",
    "mitra_unit": "Telkomsel Regional Jateng-DIY"
  }
}
```

---

### 2. Manajemen Pengguna (`/api/users`)
*Hanya dapat diakses oleh role `admin` (Mitra ditolak dengan HTTP 403).*

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/users` | Admin | Menampilkan daftar seluruh user (filter: `?role=mitra`) |
| `GET` | `/api/users/:id` | Admin | Detail user berdasarkan ID |
| `POST` | `/api/users` | Admin | Membuat akun baru (`admin` atau `mitra`) |
| `PUT` | `/api/users/:id` | Admin | Memperbarui akun user |
| `DELETE` | `/api/users/:id` | Admin | Menghapus akun user |

---

### 3. BTS Sites (`/api/sites`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/sites` | Admin & Mitra | Daftar BTS sites (filter: `?status=Active`, `?search=Tembalang`) |
| `GET` | `/api/sites/:id` | Admin & Mitra | Detail BTS site berdasarkan ID |
| `POST` | `/api/sites` | **Admin Only** | Tambah BTS site baru |
| `PUT` | `/api/sites/:id` | **Admin Only** | Update BTS site |
| `DELETE` | `/api/sites/:id` | **Admin Only** | Hapus BTS site |

*Catatan: Akses write (POST, PUT, DELETE) oleh akun mitra akan ditolak dengan respons `HTTP 403 Forbidden`.*

---

### 4. Signal Logs (`/api/signal-logs`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/signal-logs` | Admin & Mitra | Riwayat log sinyal (filter: `?enb_id=`, `?quality_label=`) |
| `GET` | `/api/signal-logs/:id` | Admin & Mitra | Detail log sinyal berdasarkan ID |
| `POST` | `/api/signal-logs` | Admin & Mitra | Simpan hasil pengujian / ekstraksi OCR |
| `DELETE` | `/api/signal-logs/:id` | **Admin Only** | Hapus log sinyal |

#### Contoh Request POST `/api/signal-logs`:
```json
POST /api/signal-logs
Content-Type: application/json
Authorization: Bearer <token>

{
  "enb_id": "990101",
  "longitude": 110.438500,
  "latitude": -7.050300,
  "rsrp": -84.50,
  "rsrq": -9.00,
  "snr": 19.50,
  "notes": "Pengujian drive test OCR - Sinyal optimal"
}
```
*Sistem secara otomatis mengisi `site_name` menjadi `'TSEL_UNDIP_TEMBALANG'` dan `quality_label` menjadi `'Sangat Baik'`.*

---

## ☁️ Deployment Serverless ke Vercel

Proyek ini telah dilengkapi dengan `vercel.json` dan konfigurasi CORS wildcard (`origin: '*'`).

Langkah deployment ke Vercel:
1. Pastikan Anda memiliki akun di [Vercel](https://vercel.com) dan database cloud aktif (misal Supabase).
2. Dari direktori `backend/`:
   ```bash
   vercel
   ```
3. Tambahkan environment variables di dashboard Vercel:
   - `DATABASE_URL` = Connection string PostgreSQL / Supabase Anda
   - `JWT_SECRET` = String acak untuk JWT
   - `NODE_ENV` = production
