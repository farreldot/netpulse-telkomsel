import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Compass,
  Activity,
  Layers,
  ExternalLink,
  PlusCircle,
  AlertCircle,
  Signal,
} from 'lucide-react';
import { sitesApi, signalLogsApi } from '../services/api';

export default function SiteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [site, setSite] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ambil data detail site
        const siteRes = await sitesApi.getById(id);
        const siteData = siteRes.data || siteRes;
        setSite(siteData);

        // Ambil log sinyal terkait enb_id site ini
        if (siteData?.enb_id) {
          try {
            const logsRes = await signalLogsApi.getAll({ enb_id: siteData.enb_id });
            if (logsRes.success && Array.isArray(logsRes.data)) {
              setLogs(logsRes.data);
            }
          } catch {
            // Ignore if logs fail
          }
        }
      } catch (err) {
        console.error('Error fetching site detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-3 border-telkomsel-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Memuat detail BTS...</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl p-6 border border-slate-200">
        <AlertCircle className="w-8 h-8 text-telkomsel-red mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">BTS Site Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1">Data dengan ID tersebut tidak tersedia.</p>
        <button
          onClick={() => navigate('/sites')}
          className="mt-4 px-4 py-2 bg-telkomsel-red text-white text-xs font-bold rounded-xl"
        >
          Kembali ke Daftar Site
        </button>
      </div>
    );
  }

  const getQualityBadge = (quality) => {
    switch (quality) {
      case 'Sangat Baik':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Baik':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cukup':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${site.latitude},${site.longitude}`;

  return (
    <div className="space-y-4">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/sites')}
        className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-telkomsel-red transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Site</span>
      </button>

      {/* Main Site Info Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 space-y-4">
        {/* Header Title & Status */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
              eNB ID: {site.enb_id}
            </span>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {site.site_name}
            </h2>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              site.status === 'Active'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {site.status}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-start space-x-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <MapPin className="w-4 h-4 text-telkomsel-red flex-shrink-0 mt-0.5" />
          <span>{site.address}</span>
        </div>

        {/* Technical Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-1 text-slate-400 mb-0.5">
              <Layers className="w-3.5 h-3.5 text-telkomsel-red" />
              <span className="text-[10px] font-semibold text-slate-500">Frekuensi Band</span>
            </div>
            <p className="font-bold text-slate-800 text-[11px]">{site.frequency_band || '4G LTE'}</p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-1 text-slate-400 mb-0.5">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-semibold text-slate-500">Koordinat GPS</span>
            </div>
            <p className="font-bold text-slate-800 text-[11px]">
              {parseFloat(site.latitude).toFixed(4)}, {parseFloat(site.longitude).toFixed(4)}
            </p>
          </div>
        </div>

        {/* Actions Button */}
        <div className="pt-2 flex items-center space-x-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka di Google Maps</span>
          </a>

          <button
            onClick={() => navigate(`/scan?enb=${site.enb_id}&name=${encodeURIComponent(site.site_name)}`)}
            className="flex-1 py-2 px-3 bg-telkomsel-red hover:bg-telkomsel-darkred text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-transform active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Uji Sinyal Site Ini</span>
          </button>
        </div>
      </div>

      {/* Signal Logs for this site */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-telkomsel-red" />
            <span>Riwayat Uji Sinyal Terkait ({logs.length})</span>
          </h3>
        </div>

        {logs.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center border border-slate-200">
            <Signal className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-600">Belum ada catatan uji sinyal</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Gunakan tombol "Uji Sinyal Site Ini" untuk mencatat hasil drive test.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                onClick={() => navigate(`/logs/${log.id}`)}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm hover:border-red-200 cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getQualityBadge(
                      log.quality_label
                    )}`}
                  >
                    {log.quality_label || 'Uji Sinyal'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">RSRP</span>
                    <span className="text-xs font-bold text-slate-800">{log.rsrp} dBm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">RSRQ</span>
                    <span className="text-xs font-bold text-slate-800">{log.rsrq} dB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">SNR</span>
                    <span className="text-xs font-bold text-slate-800">{log.snr} dB</span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Penguji: {log.tested_by || 'Mitra'}</span>
                  <span className="text-telkomsel-red font-semibold">Lihat Detail &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
