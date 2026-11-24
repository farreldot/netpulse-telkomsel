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
  ChevronRight,
  Radio,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { sitesApi, signalLogsApi } from '../services/api';
import PageTransition from '../components/PageTransition';

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
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80">
        <div className="w-10 h-10 border-3 border-telkomsel-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-600 font-semibold">Memuat spesifikasi BTS Telkomsel...</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl p-6 border border-slate-200 shadow-card">
        <AlertCircle className="w-10 h-10 text-telkomsel-red mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">BTS Site Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Data menara BTS dengan ID tersebut tidak ditemukan pada sistem database.
        </p>
        <button
          onClick={() => navigate('/sites')}
          className="mt-5 px-5 py-2.5 bg-telkomsel-gradient text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          Kembali ke Daftar Site
        </button>
      </div>
    );
  }

  const getQualityBadge = (quality) => {
    switch (quality) {
      case 'Sangat Baik':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Baik':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'Cukup':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      default:
        return 'bg-red-50 text-red-700 border-red-200/80';
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${site.latitude},${site.longitude}`;

  return (
    <PageTransition className="space-y-6">
      {/* Top Navigation */}
      <div>
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/sites')}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-telkomsel-red transition-colors py-1 px-2 -ml-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar BTS</span>
        </motion.button>
      </div>

      {/* Responsive Grid: 2-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Main Site Info Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/90 space-y-5">
          {/* Header Title & Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <span className="text-xs font-black bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 font-mono inline-block">
                eNB ID: {site.enb_id}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {site.site_name}
              </h2>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                site.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : 'bg-amber-50 text-amber-700 border-amber-200/80'
              }`}
            >
              {site.status}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <MapPin className="w-4 h-4 text-telkomsel-red flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{site.address}</span>
          </div>

          {/* Technical Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-telkomsel-red" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Frekuensi Band
                </span>
              </div>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                {site.frequency_band || '4G LTE'}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Koordinat GPS
                </span>
              </div>
              <p className="font-extrabold text-slate-900 font-mono text-[11px] sm:text-xs truncate">
                {parseFloat(site.latitude).toFixed(4)}, {parseFloat(site.longitude).toFixed(4)}
              </p>
            </div>
          </div>

          {/* Actions Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Google Maps</span>
            </a>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                navigate(`/scan?enb=${site.enb_id}&name=${encodeURIComponent(site.site_name)}`)
              }
              className="flex-1 py-2.5 px-3 bg-telkomsel-gradient hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-md shadow-red-500/20 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Uji Sinyal Site Ini</span>
            </motion.button>
          </div>
        </div>

        {/* Right Column: Signal Logs for this site */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-red-50 text-telkomsel-red">
                <Activity className="w-4 h-4" />
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Riwayat Pengujian Sinyal ({logs.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">eNodeB {site.enb_id}</span>
          </div>

          {logs.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/90 shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-telkomsel-red flex items-center justify-center mx-auto mb-3">
                <Signal className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Belum Ada Catatan Uji Sinyal</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Lakukan pengujian lapangan atau pindai screenshot G-NetTrack untuk mencatat kualitas sinyal BTS ini.
              </p>
              <button
                onClick={() =>
                  navigate(`/scan?enb=${site.enb_id}&name=${encodeURIComponent(site.site_name)}`)
                }
                className="mt-4 px-4 py-2 bg-telkomsel-gradient text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Mulai Uji Sinyal Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3.5">
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/logs/${log.id}`)}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-red-200 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getQualityBadge(
                          log.quality_label
                        )}`}
                      >
                        {log.quality_label || 'Uji Sinyal'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(log.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2.5 my-2 border-y border-slate-100 text-center bg-slate-50/60 rounded-xl">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">RSRP</span>
                        <span className="text-xs font-black text-slate-800">{log.rsrp} dBm</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">RSRQ</span>
                        <span className="text-xs font-black text-slate-800">{log.rsrq} dB</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">SNR</span>
                        <span className="text-xs font-black text-slate-800">{log.snr} dB</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Penguji: <strong className="text-slate-700">{log.tested_by || 'Mitra'}</strong></span>
                    <span className="text-telkomsel-red font-bold flex items-center space-x-0.5">
                      <span>Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
