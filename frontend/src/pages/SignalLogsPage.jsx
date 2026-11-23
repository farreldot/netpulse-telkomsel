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
} from 'lucide-react';
import { signalLogsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Baik':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cukup':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-telkomsel-red" />
            <span>Riwayat Uji Sinyal</span>
          </h2>
          <p className="text-[11px] text-slate-500">Hasil Drive Test & Scan OCR</p>
        </div>

        <button
          onClick={() => navigate('/scan')}
          className="flex items-center space-x-1 bg-telkomsel-red hover:bg-telkomsel-darkred text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-sm transition-transform active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Uji Baru</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/80 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari eNB, nama site, atau penguji..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white transition-all"
          />
        </div>

        {/* Quality Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'Sangat Baik', label: 'Sangat Baik' },
            { id: 'Baik', label: 'Baik' },
            { id: 'Cukup', label: 'Cukup' },
            { id: 'Buruk', label: 'Buruk' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setQualityFilter(tab.id)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                qualityFilter === tab.id
                  ? 'bg-telkomsel-red text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-telkomsel-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Memuat log pengujian sinyal...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">Tidak ada log sinyal yang cocok</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Gunakan tombol "Uji Baru" untuk memasukkan data pengujian.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => navigate(`/logs/${log.id}`)}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/90 hover:border-red-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] group"
            >
              {/* Top Row: eNB, Quality, and Admin Delete */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200">
                    eNB {log.enb_id || '-'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getQualityBadge(
                      log.quality_label
                    )}`}
                  >
                    {log.quality_label || 'Tidak Diketahui'}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDelete(e, log)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-telkomsel-red transition-colors" />
                </div>
              </div>

              {/* Site Name */}
              <h3 className="text-xs font-bold text-slate-900 mt-1.5 group-hover:text-telkomsel-red transition-colors">
                {log.site_name || 'BTS Tanpa Nama'}
              </h3>

              {/* RF Parameters 3-Col Box */}
              <div className="grid grid-cols-3 gap-2 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">RSRP</span>
                  <span className="text-xs font-black text-slate-800">{log.rsrp} dBm</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">RSRQ</span>
                  <span className="text-xs font-black text-slate-800">{log.rsrq} dB</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">SNR</span>
                  <span className="text-xs font-black text-slate-800">{log.snr} dB</span>
                </div>
              </div>

              {/* Bottom Info: Coordinates, Tester, Time */}
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center space-x-1 truncate max-w-[160px]">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">
                    {parseFloat(log.latitude).toFixed(4)}, {parseFloat(log.longitude).toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="font-medium text-slate-700">{log.tested_by || 'Mitra'}</span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center space-x-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {new Date(log.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
