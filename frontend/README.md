# NetPulse Log Telkomsel - Progressive Web App (PWA)

Aplikasi **Progressive Web App (PWA)** khusus monitoring jaringan BTS dan pengujian sinyal drive test Telkomsel area Semarang & Tembalang. Dibangun menggunakan **React**, **Vite**, **Tailwind CSS**, **React Router DOM**, **Lucide React**, dan **`vite-plugin-pwa`**.

---

## 🎨 Tema Visual & Desain

- **Dominasi Merah Khas Telkomsel**: `#EC2028` (Primary) dan `#B91C1C` / `#991B1B` (Dark Red).
- **Aksen Abu-abu Gelap**: `#1E293B` (Slate-800).
- **Putih Bersih**: Kontras optimal pada kartu dan formulir.
- **Mobile-First Responsive**: Dioptimalkan untuk layar smartphone dengan dukungan safe-area notch (iOS & Android) serta tetap proporsional dan rapi di layar desktop/tablet.

---

## 📱 Fitur PWA & Offline Support

- **Web App Manifest**: Nama aplikasi "NetPulse Log Telkomsel", short_name "NetPulse", theme_color `#EC2028`, display `standalone`.
- **Service Worker (`vite-plugin-pwa`)**: Caching aset statis (HTML, CSS, JS, SVG) dan runtime caching API untuk pengoperasian saat offline atau jaringan tidak stabil.
- **PWA Install Banner**: Tombol download/install otomatis muncul di header jika browser mendukung instalasi PWA.
- **Deteksi Status Koneksi**: Indikator *Online* / *Offline* real-time di bagian header.
- **Vercel Rewrite**: `vercel.json` dengan rewrite rule `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}` agar tidak terjadi error 404 saat refresh halaman di hosting Vercel.

---

## 🧭 Navigasi Utama (Fixed Bottom Navigation Bar)

Bottom navigation bar terletak pada `position: fixed; bottom: 0`:
1. **Daftar Site** (`/sites`): Ikon Radio/Tower BTS.
2. **Log Sinyal** (`/logs`): Ikon Activity/Sinyal.
3. **Uji OCR** (`/scan`): Tombol aksi utama di tengah dengan aksen warna merah menyala.
4. **Mitra** (`/mitra`): Ikon Users &mdash; **HANYA tampil jika user berstatus `admin`**.
5. **Profil** (`/profile`): Ikon Pengguna.

---

## 📄 7 Halaman Utama

1. **Halaman 1 &mdash; Daftar Site (`/sites`)**:
   - List master data BTS Telkomsel area Semarang & Tembalang.
   - Pencarian real-time berdasarkan nama site, eNB ID, atau alamat.
   - Filter status: *Semua*, *Aktif*, *Maintenance*.
   - **Role Admin**: Tombol "+ Tambah Site", tombol Edit, dan Hapus pada setiap kartu site.
   - **Role Mitra**: Seluruh tombol modifikasi disembunyikan (view-only).
   - Klik kartu site membuka `/sites/:id`.

2. **Halaman 2 &mdash; Detail Site (`/sites/:id`)**:
   - Informasi lengkap BTS (eNB ID, Nama Site, Alamat, Koordinat Lat/Lon, Frekuensi Band, Status).
   - Tombol buka lokasi langsung di Google Maps.
   - **Riwayat Log Sinyal**: Menampilkan seluruh data pengujian sinyal yang terhubung dengan eNB ID site tersebut.
   - Tombol "+ Uji Sinyal Site Ini" untuk langsung mencatat uji sinyal dengan prefill eNB & nama site.

3. **Halaman 3 &mdash; Log Sinyal (`/logs`)**:
   - Daftar riwayat pengujian kualitas jaringan hasil drive test & scan OCR.
   - Badge warna kualitas sinyal otomatis berdasarkan nilai RSRP:
     - **Sangat Baik** ($\ge -85\text{ dBm}$): Hijau Emerald
     - **Baik** ($\ge -95\text{ dBm}$): Biru
     - **Cukup** ($\ge -105\text{ dBm}$): Kuning/Amber
     - **Buruk** ($< -105\text{ dBm}$): Merah
   - Parameter tertera: eNB ID, koordinat GPS, RSRP, RSRQ, SNR, penguji, dan tanggal uji.
   - Filter tab berdasarkan level kualitas sinyal.
   - Klik kartu membuka detail log di `/logs/:id`.

4. **Halaman 4 &mdash; Detail Log Sinyal (`/logs/:id`)**:
   - Banner status kualitas jaringan (Sangat Baik / Baik / Cukup / Buruk).
   - Kartu relasi site BTS & koordinat GPS dengan link ke Google Maps.
   - Tampilan visual parameter RF 4G LTE (RSRP dBm, RSRQ dB, SNR dB) beserta panduan nilai ambang batas.
   - Catatan lapangan, nama penguji, dan waktu pengujian.
   - Tombol hapus khusus role Admin.

5. **Halaman 5 &mdash; Uji Sinyal OCR (`/scan`) & Modul `gnettrackOcr.js`**:
   - **Position-Independent Parsing**: Pindai seluruh teks tanpa pemotongan posisi tetap (bounding-box) sehingga fleksibel untuk berbagai resolusi layar, rasio aspek, maupun posisi scroll.
   - **Pra-pemrosesan Canvas**: Gambar dikecilkan proporsional (jika > 1280px), diubah ke grayscale standar ITU-R BT.601, dan dinaikkan kontrasnya (+55 level) untuk pemrosesan cepat (~1-2 detik).
   - **Regex Toleran Kesalahan Baca**:
     1. **Base Station ID (eNB)**: `eNB`, `eNodeB`, `ENB`, `Cell ID` diikuti 4–9 digit.
     2. **Latitude**: Label `Latitude`/`Lat` atau pola gabungan `Lat/Lon`.
     3. **Longitude**: Label `Longitude`/`Lon`/`Long`/`Lng`.
     4. **RSRP**: Label `RSRP`/`RSRP1` (rentang -140 s.d. -44 dBm, auto koreksi tanda minus).
     5. **RSRQ**: Label `RSRQ`/`RSRQ1` (rentang -20 s.d. -3 dB).
     6. **SNR**: Label `SNR`/`SINR` (rentang -10 s.d. 35 dB).
   - **Tesseract Worker**: Dikelola secara efisien dengan pembaruan progress bar 0%–100%.
   - **Collapsible Teks Mentah OCR**: Tombol akordeon untuk melihat teks mentah hasil OCR untuk keperluan debugging.
   - **Form Hasil Ekstraksi**: Seluruh 6 parameter otomatis terisi dan dapat dikoreksi manual oleh pengguna.
   - **Tombol Preset Cepat Responsi**: 3 opsi data sampel (Sangat Baik, Cukup, Buruk).
   - **Simpan ke API**: Menghubungi `POST /api/signal-logs` dan mengarahkan ke `/logs`.

6. **Halaman 6 &mdash; Kelola Mitra (`/mitra`)**:
   - **Khusus Administrator** (dilindungi oleh route guard; role Mitra akan dialihkan otomatis).
   - Daftar akun pengguna (Mitra & Admin) dengan unit kerja dan username.
   - Tombol "+ Tambah Mitra" modal/form untuk membuat akun mitra baru.
   - Tombol toggle status aktif/nonaktif akun.
   - Fitur Edit dan Hapus akun (dengan proteksi anti-hapus akun sendiri).

7. **Halaman 7 &mdash; Profile & About (`/profile`)**:
   - Informasi profil pengguna yang sedang login (Nama, Username, Role badge, Unit kerja).
   - Statistik ringkas total BTS Sites dan total log pengujian sinyal.
   - Tombol Logout.
   - **Kartu Informasi Pengembang Wajib**:
     - **Nama**: Farrel Revanza AlHuwaida
     - **NIM**: 21120124130075
     - **Program Studi**: Teknik Komputer
     - **Institusi**: Universitas Diponegoro
     - **Keterangan**: Tugas Akhir Praktikum Pemrograman Perangkat Bergerak

8. **Halaman Login (`/login`)**:
   - Form login otentikasi JWT dengan visual Telkomsel.
   - **Tombol Isi Cepat Demo**:
     - Tombol *Akun Admin* (`admin` / `admin123`)
     - Tombol *Akun Mitra* (`mitra1` / `mitra123`)
   - Penyimpanan token & profil pengguna pada `localStorage`.

---

## 🛠️ Menjalankan Proyek

1. **Instalasi Dependensi**:
   ```bash
   cd frontend
   npm install
   ```

2. **Menjalankan Server Development**:
   ```bash
   npm run dev
   ```

3. **Build untuk Production / PWA**:
   ```bash
   npm run build
   ```

4. **Preview Hasil Build**:
   ```bash
   npm run preview
   ```
