import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building,
  LogOut,
  Radio,
  Activity,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sitesApi, signalLogsApi } from '../services/api';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSites: 8,
    totalLogs: 3,
  });

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

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
          <User className="w-4 h-4 text-telkomsel-red" />
          <span>Profil Pengguna & Aplikasi</span>
        </h2>
        <p className="text-[11px] text-slate-500">Informasi Akun dan Pengembang Sistem</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 space-y-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-telkomsel-red to-telkomsel-darkred text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <h3 className="font-extrabold text-sm text-slate-900 truncate">
                {user?.full_name || 'Pengguna Telkomsel'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono">@{user?.username || 'user'}</p>

            <div className="mt-1 flex items-center space-x-1.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  user?.role === 'admin'
                    ? 'bg-red-50 text-telkomsel-red border border-red-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {user?.role === 'admin' ? 'Administrator' : 'Mitra Drive Test'}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Unit Info */}
        <div className="pt-3 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
          <Building className="w-4 h-4 text-telkomsel-red flex-shrink-0" />
          <span className="font-medium truncate">
            {user?.mitra_unit || 'Telkomsel Regional Jateng-DIY'}
          </span>
        </div>
      </div>

      {/* Quick Summary Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-telkomsel-red flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block leading-tight">
              {stats.totalSites}
            </span>
            <span className="text-[10px] font-semibold text-slate-500">Total BTS Sites</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block leading-tight">
              {stats.totalLogs}
            </span>
            <span className="text-[10px] font-semibold text-slate-500">Log Pengujian</span>
          </div>
        </div>
      </div>

      {/* Kartu Informasi Pengembang (Wajib Sesuai Spesifikasi) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 text-white rounded-3xl p-5 shadow-lg space-y-3.5 border border-slate-700">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-telkomsel-red" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Informasi Pengembang
            </h3>
          </div>
          <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
            TA Praktikum PPB
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Nama Mahasiswa:</span>
            <p className="text-sm font-black text-white tracking-wide">
              Farrel Revanza AlHuwaida
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">NIM:</span>
              <p className="font-mono font-bold text-slate-200 text-xs">21120124130075</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Program Studi:</span>
              <p className="font-semibold text-slate-200 text-xs">Teknik Komputer</p>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-[10px] text-slate-400 block font-medium">Institusi:</span>
            <p className="font-bold text-slate-200 text-xs">
              Universitas Diponegoro (Semarang)
            </p>
          </div>

          <div className="mt-2 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-300 leading-relaxed">
            <p className="font-semibold text-white mb-0.5 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-telkomsel-red" />
              <span>Tugas Akhir Praktikum:</span>
            </p>
            <p className="text-slate-300">
              Pemrograman Perangkat Bergerak &bull; Sistem Monitoring BTS & Drive Test Telkomsel PWA
            </p>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-2xl font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun (Logout)</span>
        </button>
      </div>

      <p className="text-[10px] text-slate-400 text-center">
        NetPulse Log v1.0.0 &bull; PWA Offline Ready
      </p>
    </div>
  );
}
