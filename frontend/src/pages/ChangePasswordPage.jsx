import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  LogOut,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import PageTransition from '../components/PageTransition';

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateUser, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!oldPassword.trim()) {
      setErrorMsg('Harap masukkan password sementara Anda.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password baru minimal harus terdiri dari 6 karakter.');
      return;
    }

    if (newPassword === oldPassword) {
      setErrorMsg('Password baru tidak boleh sama dengan password sementara.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.changePassword({
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
      });

      if (response.success) {
        setSuccessMsg('Password berhasil diperbarui! Mengalihkan ke Uji OCR...');
        updateUser({ must_change_password: false });
        setTimeout(() => {
          navigate('/scan', { replace: true });
        }, 800);
      } else {
        throw new Error(response.message || 'Gagal mengubah password.');
      }
    } catch (err) {
      console.error('[ChangePassword Error]:', err);
      const msg =
        err.response?.data?.message ||
        err.data?.message ||
        err.message ||
        'Terjadi kesalahan saat mengubah password.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Batalkan ganti password dan keluar dari akun?')) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <PageTransition className="max-w-lg mx-auto py-4 sm:py-8 space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-2">
        <span className="p-1.5 rounded-lg bg-red-50 text-telkomsel-red">
          <KeyRound className="w-5 h-5" />
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Ganti Password Akun
        </h2>
      </div>

      {/* Banner Informasi Wajib Ganti Password */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start space-x-3"
      >
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-amber-900">
            Aktivasi Keamanan Akun Pertama Kali
          </h4>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-normal">
            Akun Anda menggunakan password sementara dari Admin. Silakan buat password baru untuk melanjutkan.
          </p>
        </div>
      </motion.div>

      {/* Main Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/90 space-y-5"
      >
        <div>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-telkomsel-red bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-md inline-block mb-1.5">
            Pengguna: @{user?.username || 'mitra'}
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            Form Pembaruan Kredensial
          </h3>
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

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-2.5 text-xs text-emerald-700 font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Password Sementara */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password Sementara
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password sementara dari Admin"
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 p-1"
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 2. Password Baru */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password Baru <span className="text-slate-400 font-normal">(Min. 6 karakter)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru Anda"
                autoComplete="new-password"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 p-1"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3. Konfirmasi Password Baru */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru Anda"
                autoComplete="new-password"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-telkomsel-gradient hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-red-500/20 transition-all disabled:opacity-70 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Simpan Password Baru & Lanjutkan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Tombol Keluar dari Akun */}
        <div className="pt-3 text-center border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-telkomsel-red transition-colors py-1 px-3 rounded-lg hover:bg-red-50/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </motion.div>
    </PageTransition>
  );
}
