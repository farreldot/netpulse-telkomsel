import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Radio, Lock, User, Eye, EyeOff, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
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
      setErrorMsg('Harap isi username dan password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username.trim(), password.trim());
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.message || 'Login gagal. Periksa kembali akun Anda.');
    }
  };

  const handleQuickFill = (role) => {
    setErrorMsg('');
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('mitra1');
      setPassword('mitra123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 via-telkomsel-red to-telkomsel-darkred flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-white rounded-2xl mx-auto shadow-xl flex items-center justify-center mb-3 transform hover:scale-105 transition-transform">
          <Radio className="w-9 h-9 text-telkomsel-red" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          NetPulse <span className="text-red-200">Log</span>
        </h1>
        <p className="text-xs text-red-100 font-medium mt-1">
          PWA Drive Test & Monitoring Jaringan BTS Telkomsel
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-red-100">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">Masuk ke Sistem</h2>
          <p className="text-xs text-slate-500">
            Gunakan kredensial resmi Telkomsel atau pilih akun demo
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-telkomsel-red focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-telkomsel-red focus:bg-white transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-telkomsel-red hover:bg-telkomsel-darkred text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <Zap className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Tombol Isi Cepat Demo (Sesuai Spesifikasi Prompt) */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 mb-2.5 text-center flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-telkomsel-red" />
            <span>Pilihan Akses Cepat Demo (Responsi):</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="py-2 px-2.5 bg-slate-100 hover:bg-red-50 hover:border-red-200 border border-slate-200 rounded-xl text-left transition-all active:scale-95"
            >
              <div className="flex items-center space-x-1 text-slate-800 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-telkomsel-red"></span>
                <span>Akun Admin</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">admin / admin123</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('mitra')}
              className="py-2 px-2.5 bg-slate-100 hover:bg-red-50 hover:border-red-200 border border-slate-200 rounded-xl text-left transition-all active:scale-95"
            >
              <div className="flex items-center space-x-1 text-slate-800 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Akun Mitra</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">mitra1 / mitra123</p>
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-white/70 text-center mt-5">
        &copy; 2026 NetPulse Log Telkomsel &bull; Mobile PWA System
      </p>
    </div>
  );
}
