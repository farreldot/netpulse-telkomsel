import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  MapPin,
  Calendar,
  User,
  ExternalLink,
  Trash2,
  FileText,
  AlertCircle,
  Radio,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { signalLogsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

export default function SignalLogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await signalLogsApi.getById(id);
        setLog(res.data || res);
      } catch (err) {
        console.error('Error fetching signal log detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Yakin ingin menghapus catatan log sinyal ini?')) return;

    try {
      await signalLogsApi.delete(id);
      navigate('/logs', { replace: true });
    } catch {
      navigate('/logs', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80">
        <div className="w-10 h-10 border-3 border-telkomsel-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-600 font-semibold">Memuat detail parameter sinyal...</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl p-6 border border-slate-200 shadow-card">
        <AlertCircle className="w-10 h-10 text-telkomsel-red mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Log Sinyal Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Catatan pengujian RF dengan ID #{id} tidak tersedia pada sistem.
        </p>
        <button
          onClick={() => navigate('/logs')}
          className="mt-5 px-5 py-2.5 bg-telkomsel-gradient text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          Kembali ke Riwayat Log
        </button>
      </div>
    );
  }

  const getQualityBadge = (quality) => {
    switch (quality) {
      case 'Sangat Baik':
        return {
          bg: 'bg-emerald-600',
          gradient: 'from-emerald-600 to-teal-700',
          desc: 'Kondisi sinyal radio sangat prima, tingkat interferensi minimal dan throughput transfer data maksimal.',
        };
      case 'Baik':
        return {
          bg: 'bg-blue-600',
          gradient: 'from-blue-600 to-indigo-700',
          desc: 'Kondisi sinyal stabil, throughput video streaming & browsing sangat lancar tanpa buffering.',
        };
      case 'Cukup':
        return {
          bg: 'bg-amber-500',
          gradient: 'from-amber-500 to-orange-600',
          desc: 'Sinyal memadai untuk percakapan & browsing ringan, namun throughput rentan fluktuatif di area indoor.',
        };
      default:
        return {
          bg: 'bg-telkomsel-red',
          gradient: 'from-red-600 to-telkomsel-darkred',
          desc: 'Sinyal lemah, kemungkinan blank spot atau tertutup halangan gedung/kontur geografis perbukitan.',
        };
    }
  };

  const badgeStyle = getQualityBadge(log.quality_label);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`;

  return (
    <PageTransition className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/logs')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-telkomsel-red transition-colors py-1 px-2 -ml-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Log Sinyal</span>
        </motion.button>

        {isAdmin && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="flex items-center space-x-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200/80 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Catatan Ini</span>
          </motion.button>
        )}
      </div>

      {/* Responsive Grid: 2-column on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quality Banner & Site Info */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Quality Banner */}
          <div
            className={`bg-gradient-to-br ${badgeStyle.gradient} rounded-3xl p-6 text-white shadow-lg space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold bg-white/20 uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
                Status Kualitas Jaringan
              </span>
              <span className="text-xs text-white/80 font-bold font-mono">
                Log #{log.id}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{log.quality_label}</h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
              {badgeStyle.desc}
            </p>
          </div>

          {/* BTS Site Link Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/90 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  BTS Pemancar Terhubung
                </span>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {log.site_name || 'BTS Belum Terdaftar'}
                </h3>
              </div>
              <span className="text-xs font-black bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 font-mono">
                eNB {log.enb_id || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-600 font-mono">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>
                  {parseFloat(log.latitude).toFixed(5)}, {parseFloat(log.longitude).toFixed(5)}
                </span>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-telkomsel-red font-bold hover:underline"
              >
                <span>Buka Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed RF Metrics & Audit Info */}
        <div className="lg:col-span-7 space-y-4">
          {/* RF Metrics Detailed Grid */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/90 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-red-50 text-telkomsel-red">
                <Activity className="w-4 h-4" />
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Parameter Radio Frequency (RF 4G LTE)
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* RSRP */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                  RSRP
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 block my-1">
                  {log.rsrp}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">dBm (Signal Power)</span>
              </div>

              {/* RSRQ */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                  RSRQ
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 block my-1">
                  {log.rsrq}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">dB (Signal Quality)</span>
              </div>

              {/* SNR */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                  SNR / SINR
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 block my-1">
                  {log.snr}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">dB (Noise Ratio)</span>
              </div>
            </div>

            {/* Reference Range Info */}
            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed space-y-1">
              <p className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-telkomsel-red" />
                <span>Standar Ambang Kualitas Telkomsel:</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800 font-semibold border border-emerald-200/60">
                  &ge; -85 dBm: Sangat Baik
                </div>
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-800 font-semibold border border-blue-200/60">
                  -86 s.d -95 dBm: Baik
                </div>
                <div className="p-1.5 bg-amber-50 rounded-lg text-amber-800 font-semibold border border-amber-200/60">
                  -96 s.d -105 dBm: Cukup
                </div>
                <div className="p-1.5 bg-red-50 rounded-lg text-red-800 font-semibold border border-red-200/60">
                  &lt; -105 dBm: Buruk
                </div>
              </div>
            </div>
          </div>

          {/* Field Notes & Test Audit Info */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/90 space-y-3.5">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-red-50 text-telkomsel-red">
                <FileText className="w-4 h-4" />
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Informasi Audit & Catatan Lapangan
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Nama Petugas Penguji:</span>
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{log.tested_by || 'Mitra Drive Test'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Waktu Pengambilan Data:</span>
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    {new Date(log.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </span>
              </div>

              <div className="pt-1">
                <span className="text-slate-500 block mb-1.5 font-medium">Catatan Lapangan:</span>
                <p className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-slate-800 leading-relaxed font-medium">
                  {log.notes || 'Tidak ada catatan tambahan untuk pengujian ini.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
