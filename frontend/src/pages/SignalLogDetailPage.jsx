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
} from 'lucide-react';
import { signalLogsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
      <div className="text-center py-16">
        <div className="w-8 h-8 border-3 border-telkomsel-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Memuat detail log sinyal...</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl p-6 border border-slate-200">
        <AlertCircle className="w-8 h-8 text-telkomsel-red mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">Log Sinyal Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1">Data dengan ID tersebut tidak tersedia.</p>
        <button
          onClick={() => navigate('/logs')}
          className="mt-4 px-4 py-2 bg-telkomsel-red text-white text-xs font-bold rounded-xl"
        >
          Kembali ke Daftar Log
        </button>
      </div>
    );
  }

  const getQualityBadge = (quality) => {
    switch (quality) {
      case 'Sangat Baik':
        return {
          bg: 'bg-emerald-500',
          text: 'text-white',
          border: 'border-emerald-600',
          desc: 'Kondisi sinyal sangat kuat dan bebas interferensi tinggi.',
        };
      case 'Baik':
        return {
          bg: 'bg-blue-600',
          text: 'text-white',
          border: 'border-blue-700',
          desc: 'Kondisi sinyal stabil, throughput video & data lancar.',
        };
      case 'Cukup':
        return {
          bg: 'bg-amber-500',
          text: 'text-white',
          border: 'border-amber-600',
          desc: 'Sinyal memadai, throughput fluktuatif di area indoor.',
        };
      default:
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          border: 'border-red-700',
          desc: 'Sinyal lemah, kemungkinan blank spot atau tertutup gedung.',
        };
    }
  };

  const badgeStyle = getQualityBadge(log.quality_label);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`;

  return (
    <div className="space-y-4">
      {/* Top Back Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/logs')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-telkomsel-red transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Log Sinyal</span>
        </button>

        {isAdmin && (
          <button
            onClick={handleDelete}
            className="flex items-center space-x-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        )}
      </div>

      {/* Main Signal Quality Banner */}
      <div className={`${badgeStyle.bg} rounded-3xl p-5 text-white shadow-lg space-y-2`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold bg-white/20 uppercase tracking-widest px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            Status Kualitas Jaringan
          </span>
          <span className="text-xs text-white/80 font-medium">
            Log #{log.id}
          </span>
        </div>

        <h2 className="text-2xl font-black tracking-tight">{log.quality_label}</h2>
        <p className="text-xs text-white/90 leading-relaxed">{badgeStyle.desc}</p>
      </div>

      {/* BTS Site Link Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-telkomsel-red" />
            <h3 className="text-xs font-bold text-slate-900">{log.site_name || 'BTS Belum Terdaftar'}</h3>
          </div>
          <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
            eNB {log.enb_id || '-'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {parseFloat(log.latitude).toFixed(5)}, {parseFloat(log.longitude).toFixed(5)}
            </span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-telkomsel-red font-bold hover:underline text-[11px]"
          >
            <span>Buka Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* RF Metrics Detailed Grid */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
          <Activity className="w-4 h-4 text-telkomsel-red" />
          <span>Parameter Radio Frequency (RF 4G LTE)</span>
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          {/* RSRP */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">RSRP</span>
            <span className="text-sm font-black text-slate-900 block my-0.5">{log.rsrp}</span>
            <span className="text-[9px] text-slate-500 font-medium">dBm (Power)</span>
          </div>

          {/* RSRQ */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">RSRQ</span>
            <span className="text-sm font-black text-slate-900 block my-0.5">{log.rsrq}</span>
            <span className="text-[9px] text-slate-500 font-medium">dB (Quality)</span>
          </div>

          {/* SNR */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">SNR / SINR</span>
            <span className="text-sm font-black text-slate-900 block my-0.5">{log.snr}</span>
            <span className="text-[9px] text-slate-500 font-medium">dB (Noise Ratio)</span>
          </div>
        </div>

        {/* Reference Range Info */}
        <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-normal">
          <p className="font-semibold text-slate-700 mb-0.5">Panduan Nilai Ambang RSRP:</p>
          <p>&bull; &ge; -85 dBm: Sangat Baik | &ge; -95 dBm: Baik | &ge; -105 dBm: Cukup | &lt; -105 dBm: Buruk</p>
        </div>
      </div>

      {/* Field Notes & Test Audit Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
          <FileText className="w-4 h-4 text-telkomsel-red" />
          <span>Informasi Pengujian Lapangan</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Nama Penguji:</span>
            <span className="font-bold text-slate-800 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{log.tested_by || 'Mitra Drive Test'}</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Waktu Pengujian:</span>
            <span className="font-bold text-slate-800 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
            <span className="text-slate-500 block mb-1">Catatan Lapangan:</span>
            <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-800 leading-relaxed font-medium">
              {log.notes || 'Tidak ada catatan tambahan untuk pengujian ini.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
