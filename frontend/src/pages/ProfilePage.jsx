import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building,
  LogOut,
  Radio,
  Activity,
  Download,
  CheckCircle2,
  Smartphone,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { sitesApi, signalLogsApi } from '../services/api';
import PageTransition from '../components/PageTransition';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSites: 8,
    totalLogs: 3,
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Cek apakah aplikasi sudah berjalan dalam mode PWA Standalone
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(checkStandalone);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setInstallSuccess(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sitesRes, logsRes] = await Promise.all([
          sitesApi.getAll().catch(() => ({ data: [] })),
          signalLogsApi.getAll().catch(() => ({ data: [] })),
        ]);

        setStats({
          totalSites: sitesRes.data?.length || 8,
          totalLogs: logsRes.data?.length || 3,
        });
      } catch {
        // Fallback default stats
      }
    };

    fetchStats();
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setInstallSuccess(true);
      setIsStandalone(true);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari akun NetPulse Log?')) {
      logout();
      navigate('/login');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <PageTransition className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-red-50 text-telkomsel-red">
            <User className="w-5 h-5" />
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Profil & Pengaturan Akun
          </h2>
        </div>
      </div>

      {/* Kartu Profil Utama Pengguna (Memuat identitas lengkap dari user yang sedang login) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-card border border-slate-200/90 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-black text-2xl sm:text-3xl text-white shadow-lg flex-shrink-0 ${
              isAdmin
                ? 'bg-telkomsel-gradient shadow-red-500/25'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/25'
            }`}
          >
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight truncate">
                {user?.full_name || (isAdmin ? 'Administrator Telkomsel' : 'Mitra Drive Test')}
              </h3>
              <span
                className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                  isAdmin
                    ? 'bg-red-50 text-telkomsel-red border-red-200/80'
                    : 'bg-blue-50 text-blue-700 border-blue-200/80'
                }`}
              >
                {isAdmin ? 'Administrator' : 'Mitra Drive Test'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Username: <strong className="text-slate-700">@{user?.username || 'user'}</strong>
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-telkomsel-red" />
                <span>Otoritas: <strong className="text-slate-800">{user?.role?.toUpperCase()}</strong></span>
              </div>
              <span>&bull;</span>
              <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Status Akun Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Kerja / Divisi Operasional */}
        <div className="pt-4 border-t border-slate-100 flex items-start sm:items-center space-x-3 text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <Building className="w-4 h-4 text-telkomsel-red flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Unit Kerja / Divisi Terdaftar:
            </span>
            <span className="font-bold text-slate-900">
              {user?.mitra_unit || (isAdmin ? 'Telkomsel Regional Jateng-DIY' : 'Mitra Drive Test Semarang')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Summary Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card flex items-center space-x-3.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-telkomsel-red flex items-center justify-center flex-shrink-0">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
              {stats.totalSites}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">Total BTS Sites</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card flex items-center space-x-3.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
              {stats.totalLogs}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">Log Pengujian</span>
          </div>
        </motion.div>
      </div>

      {/* Kartu Khusus Instalasi Aplikasi PWA (Sesuai Permintaan) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/90 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-red-50 text-telkomsel-red">
              <Smartphone className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Instalasi Progressive Web App (PWA)
              </h3>
              <p className="text-xs text-slate-500">
                Akses cepat langsung dari layar utama tanpa membuka URL browser
              </p>
            </div>
          </div>

          {isStandalone && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Terpasang</span>
            </span>
          )}
        </div>

        {isStandalone || installSuccess ? (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start space-x-3 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Aplikasi NetPulse Log Berhasil Terpasang di Perangkat Ini</p>
              <p className="text-emerald-700 leading-relaxed font-normal">
                Sistem dapat dibuka secara mandiri layaknya aplikasi native Android/Windows, lengkap dengan dukungan cache offline untuk uji sinyal lapangan.
              </p>
            </div>
          </div>
        ) : deferredPrompt ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Perangkat Anda mendukung instalasi langsung. Pasang NetPulse Log sekarang untuk pengalaman pengguna yang lebih responsif dan hemat kuota data saat berada di area blank spot.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-5 py-2.5 bg-telkomsel-gradient hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-red-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Pasang Aplikasi ke Perangkat Ini</span>
            </motion.button>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <HelpCircle className="w-4 h-4 text-telkomsel-red" />
              <span>Panduan Pemasangan Manual:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
              <li>
                <strong>Google Chrome / Edge (Desktop/Android):</strong> Klik ikon <em>Install</em> di ujung kanan bilah alamat (URL bar) atau buka menu browser &rarr; <em>"Install NetPulse Log Telkomsel"</em>.
              </li>
              <li>
                <strong>Safari (iPhone/iPad):</strong> Tekan tombol <em>Bagikan (Share)</em> di navigasi bawah &rarr; pilih <em>"Tambah ke Layar Utama (Add to Home Screen)"</em>.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Logout Action & Versi Aplikasi */}
      <div className="pt-2 space-y-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-2xl font-bold text-xs sm:text-sm shadow-card flex items-center justify-center space-x-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun (Logout)</span>
        </motion.button>

        {/* Informasi Versi Ringkas */}
        <p className="text-center text-xs text-slate-400 font-medium">
          NetPulse Log v1.0 &bull; Telkomsel Network Audit
        </p>
      </div>
    </PageTransition>
  );
}
