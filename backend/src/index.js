const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const siteRoutes = require('./routes/siteRoutes');
const signalLogRoutes = require('./routes/signalLogRoutes');

const app = express();

// Middleware: CORS dengan origin '*' sesuai spesifikasi
app.use(cors({ origin: '*' }));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging sederhana untuk request HTTP di development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Inisialisasi database & auto-seed
initDb();

// Root & Health check routes
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'NetPulse Telkomsel REST API',
    version: '1.0.0',
    description: 'Backend REST API untuk Drive Test & Monitoring Sinyal BTS Telkomsel',
    status: 'Running',
    endpoints: {
      auth: '/api/auth/login',
      users: '/api/users',
      sites: '/api/sites',
      signalLogs: '/api/signal-logs',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Registrasi modul rute
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/signal-logs', signalLogRoutes);

// Handler untuk rute yang tidak ditemukan (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan pada server ini.`,
  });
});

// Global error handler (500)
app.use((err, req, res, next) => {
  console.error('[GlobalErrorHandler]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
  });
});

// Menjalankan server lokal (jika tidak dijalankan di lingkungan serverless Vercel)
const PORT = process.env.PORT || 5000;
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 NetPulse Telkomsel API running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`🩺 Health:   http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
