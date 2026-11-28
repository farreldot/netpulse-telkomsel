import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Clock,
  User,
  Trash2,
  ChevronRight,
  AlertCircle,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { signalLogsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

const FALLBACK_LOGS = [
  {
    id: 1,
    enb_id: '990101',
    site_name: 'TSEL_UNDIP_TEMBALANG',
    longitude: 110.4385,
    latitude: -7.0503,
    rsrp: -82.0,
    rsrq: -8.5,
    snr: 18.2,
    quality_label: 'Sangat Baik',
    notes: 'Pengujian sinyal area gerbang utama UNDIP Tembalang',
    tested_by: 'mitra1',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 2,
    enb_id: '990102',
    site_name: 'TSEL_BANJARSARI_TEMBALANG',
    longitude: 110.4421,
    latitude: -7.0582,
    rsrp: -91.5,
    rsrq: -11.0,
    snr: 12.4,
    quality_label: 'Baik',
    notes: 'Throughput stabil, kondisi cuaca cerah',
    tested_by: 'mitra1',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 3,
    enb_id: '990105',
    site_name: 'TSEL_NGESREP_TIMUR',
    longitude: 110.4289,
    latitude: -7.0425,
    rsrp: -108.0,
    rsrq: -16.5,
    snr: 3.1,
    quality_label: 'Buruk',
    notes: 'Sinyal terhalang ruko bertingkat dan kontur perbukitan',
    tested_by: 'admin',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export default function SignalLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [qualityFilter, setQualityFilter] = useState('ALL');

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await signalLogsApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        setLogs(FALLBACK_LOGS);
      }
    } catch {
      setLogs(FALLBACK_LOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (e, log) => {
    e.stopPropagation();
    if (!window.confirm(`Hapus log sinyal ID ${log.id} (${log.site_name || log.enb_id})?`)) {
      return;
    }

    try {
      await signalLogsApi.delete(log.id);
      setLogs((prev) => prev.filter((l) => l.id !== log.id));
    } catch {
      setLogs((prev) => prev.filter((l) => l.id !== log.id));
    }
  };

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

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.site_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.enb_id?.toLowerCase().includes(search.toLowerCase()) ||
      log.tested_by?.toLowerCase().includes(search.toLowerCase());

    const matchesQuality =
      qualityFilter === 'ALL' || log.quality_label === qualityFilter;

    return matchesSearch && matchesQuality;
  });

  return (
    <PageTransition className="space-y-6">
      {/* Header Bar with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-red-50 text-telkomsel-red">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Riwayat Log Sinyal
            </h2>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/scan')}
          className="self-start sm:self-auto flex items-center space-x-2 bg-telkomsel-gradient hover:opacity-95 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-md shadow-red-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Mulai Uji Sinyal Baru</span>
        </motion.button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-card border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari eNB, nama site, atau penguji..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quality Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
          {[
            { id: 'ALL', label: 'Semua Kualitas' },
            { id: 'Sangat Baik', label: 'Sangat Baik' },
            { id: 'Baik', label: 'Baik' },
            { id: 'Cukup', label: 'Cukup' },
            { id: 'Buruk', label: 'Buruk' },
          ].map((tab) => {
            const isSelected = qualityFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setQualityFilter(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Grid List: 1 col on mobile, 2 col on tablet, 3 col on desktop */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80">
          <div className="w-10 h-10 border-3 border-telkomsel-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-semibold">Memuat log pengujian sinyal...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-6">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-telkomsel-red flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Tidak ada log sinyal yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol "Mulai Uji Sinyal Baru" atau ubah filter untuk menampilkan catatan pengujian.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setQualityFilter('ALL');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredLogs.map((log) => (
            <motion.div
              key={log.id}
              layout
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => navigate(`/logs/${log.id}`)}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-card hover:shadow-card-hover border border-slate-200/90 hover:border-red-200 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Top Row: eNB, Quality, and Admin Delete */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/80 font-mono">
                      eNB {log.enb_id || '-'}
                    </span>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getQualityBadge(
                        log.quality_label
                      )}`}
                    >
                      {log.quality_label || 'Tidak Diketahui'}
                    </span>
                  </div>

                  <div
                    className="flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(e, log)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Site Name */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-telkomsel-red transition-colors line-clamp-1">
                  {log.site_name || 'BTS Tanpa Nama'}
                </h3>

                {/* RF Parameters 3-Col Box */}
                <div className="grid grid-cols-3 gap-2 mt-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">
                      RSRP
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900">
                      {log.rsrp} <span className="text-[9px] font-medium text-slate-500">dBm</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">
                      RSRQ
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900">
                      {log.rsrq} <span className="text-[9px] font-medium text-slate-500">dB</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">
                      SNR
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900">
                      {log.snr} <span className="text-[9px] font-medium text-slate-500">dB</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Info: Coordinates, Tester, Time */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1 truncate max-w-[150px] sm:max-w-[180px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate font-mono text-[11px]">
                    {parseFloat(log.latitude).toFixed(4)}, {parseFloat(log.longitude).toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px]">
                  <span className="font-semibold text-slate-700 truncate max-w-[80px]">
                    {log.tested_by || 'Mitra'}
                  </span>
                  <span>&bull;</span>
                  <span className="text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
