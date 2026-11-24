import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Radio, Lock, User, Eye, EyeOff, Zap, AlertCircle, Shield, Wifi, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/sites';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Harap masukkan username dan password akun Anda.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username.trim(), password.trim());
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.message || 'Autentikasi gagal. Periksa kembali username dan password Anda.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] selection:bg-red-500 selection:text-white">
      {/* SISI KIRI: Desktop Split-Screen Panel Branding Visual Telkomsel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative bg-gradient-to-br from-[#991B1B] via-[#B91C1C] to-[#EC2028] text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Dekorasi Gelombang Sinyal & Radio Waves Abstrak */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="400" r="180" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="200" cy="400" r="280" stroke="white" strokeWidth="1.5" />
            <circle cx="200" cy="400" r="380" stroke="white" strokeWidth="1.5" strokeDasharray="8 8" />
            <circle cx="200" cy="400" r="480" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="400" r="580" stroke="white" strokeWidth="1" strokeDasharray="12 12" />
            <path d="M0 600C250 500 450 700 800 550" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
            <path d="M0 650C300 580 500 750 800 620" stroke="white" strokeWidth="2" strokeOpacity="0.2" />
          </svg>
        </div>

        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header Branding Sisi Kiri */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
            <Radio className="w-6 h-6 text-white stroke-[2.4]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-tight text-white leading-none">NetPulse Log</span>
              <span className="text-[10px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
                Telkomsel
              </span>
            </div>
            <p className="text-xs text-red-100 font-medium mt-1">Network Audit & Drive Test Operations</p>
          </div>
        </div>

        {/* Hero Content Sisi Kiri */}
        <div className="relative z-10 my-auto py-12 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
              <Wifi className="w-3.5 h-3.5 text-red-200" />
              <span>Infrastruktur Menara BTS & Audit Sinyal 4G LTE</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-black leading-tight tracking-tight text-white">
              Sistem Terintegrasi Monitoring BTS & Kualitas Jaringan Lapangan
            </h2>

            <p className="text-sm xl:text-base text-red-100 leading-relaxed font-normal">
              Platform inspeksi terpadu teknisi Telkomsel untuk verifikasi performa parameter RF (RSRP, RSRQ, SNR), pencatatan titik koordinat eNodeB, dan ekstraksi otomatis laporan G-NetTrack.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Drive Test Audit</h4>
                  <p className="text-[11px] text-red-100">Presisi parameter sinyal</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Keamanan Sistem</h4>
                  <p className="text-[11px] text-red-100">Otorisasi Admin & Mitra</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Sisi Kiri */}
        <div className="relative z-10 flex items-center justify-between text-xs text-red-100/80 pt-6 border-t border-white/15">
          <span>Telkomsel Regional Jateng &bull; Area Semarang</span>
          <span>Versi Operasional 1.0</span>
        </div>
      </div>

      {/* SISI KANAN: Form Login Resmi (Split di Desktop, Full-width di Mobile) */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 xl:px-16 py-10 lg:py-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header Mobile Only (Disembunyikan di Desktop) */}
          <div className="text-center lg:hidden mb-2">
            <div className="w-14 h-14 bg-telkomsel-gradient rounded-2xl mx-auto shadow-md shadow-red-500/25 flex items-center justify-center mb-3">
              <Radio className="w-7 h-7 text-white stroke-[2.4]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              NetPulse <span className="text-telkomsel-gradient font-black">Log</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Portal Monitoring BTS & Uji Sinyal Telkomsel
            </p>
          </div>

          {/* Form Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-3xl shadow-card border border-slate-200/90 p-6 sm:p-8 space-y-6"
          >
            <div>
              <div className="hidden lg:flex items-center space-x-2 text-xs font-bold text-telkomsel-red uppercase tracking-wider mb-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Portal Autentikasi Resmi</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Masuk ke Akun
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Silakan masukkan kredensial akun NetPulse Anda untuk melanjutkan
              </p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2.5 text-xs text-red-700 font-medium"
              >
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username Anda"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-telkomsel-gradient hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-red-500/20 transition-all disabled:opacity-70 flex items-center justify-center space-x-2 pt-3"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <Zap className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Footer Hak Cipta & Info Keamanan */}
          <div className="text-center space-y-1 text-xs text-slate-400">
            <p className="flex items-center justify-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Sistem Akses Terenkripsi &bull; Telkomsel Regional Central</span>
            </p>
            <p className="text-[11px]">
              &copy; 2026 PT Telekomunikasi Selular. Hak cipta dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
