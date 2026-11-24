import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  Search,
  Plus,
  Filter,
  MapPin,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sitesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

// Data dummy fallback jika backend belum aktif
const FALLBACK_SITES = [
  {
    id: 1,
    enb_id: '990101',
    site_name: 'TSEL_UNDIP_TEMBALANG',
    address: 'Jl. Prof. Soedarto No. 1, Tembalang, Semarang',
    latitude: -7.0503,
    longitude: 110.4385,
    frequency_band: 'L1800 / L2100',
    status: 'Active',
  },
  {
    id: 2,
    enb_id: '990102',
    site_name: 'TSEL_BANJARSARI_TEMBALANG',
    address: 'Jl. Banjarsari Selatan, Tembalang, Semarang',
    latitude: -7.0582,
    longitude: 110.4421,
    frequency_band: 'L900 / L1800 / L2100',
    status: 'Active',
  },
  {
    id: 3,
    enb_id: '990103',
    site_name: 'TSEL_SIMPANG_LIMA_SMG',
    address: 'Kawasan Simpang Lima, Semarang Tengah',
    latitude: -6.9904,
    longitude: 110.4229,
    frequency_band: 'L1800 / L2100 / L2300',
    status: 'Active',
  },
  {
    id: 4,
    enb_id: '990104',
    site_name: 'TSEL_PANDANARAN_SMG',
    address: 'Jl. Pandanaran No. 88, Mugassari, Semarang',
    latitude: -6.9881,
    longitude: 110.415,
    frequency_band: 'L1800 / L2100',
    status: 'Active',
  },
  {
    id: 5,
    enb_id: '990105',
    site_name: 'TSEL_NGESREP_TIMUR',
    address: 'Jl. Ngesrep Timur V, Sumurboto, Banyumanik',
    latitude: -7.0425,
    longitude: 110.4289,
    frequency_band: 'L1800 / L2100',
    status: 'Active',
  },
  {
    id: 6,
    enb_id: '990106',
    site_name: 'TSEL_KOTA_LAMA_SMG',
    address: 'Kawasan Kota Lama, Jl. Letjen Suprapto, Semarang',
    latitude: -6.9682,
    longitude: 110.4278,
    frequency_band: 'L900 / L1800',
    status: 'Active',
  },
  {
    id: 7,
    enb_id: '990107',
    site_name: 'TSEL_POLINES_TEMBALANG',
    address: 'Jl. Prof. Soedarto (Kompleks Polines), Tembalang',
    latitude: -7.0545,
    longitude: 110.4342,
    frequency_band: 'L1800 / L2300',
    status: 'Maintenance',
  },
  {
    id: 8,
    enb_id: '990108',
    site_name: 'TSEL_SETIABUDI_BANYUMANIK',
    address: 'Jl. Dr. Setiabudi No. 120, Banyumanik, Semarang',
    latitude: -7.062,
    longitude: 110.4215,
    frequency_band: 'L1800 / L2100',
    status: 'Active',
  },
];

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    enb_id: '',
    site_name: '',
    address: '',
    latitude: '',
    longitude: '',
    frequency_band: 'L1800 / L2100',
    status: 'Active',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await sitesApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        setSites(res.data);
      } else {
        setSites(FALLBACK_SITES);
      }
    } catch {
      setSites(FALLBACK_SITES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const openCreateModal = () => {
    setEditingSite(null);
    setFormData({
      enb_id: '',
      site_name: '',
      address: '',
      latitude: '',
      longitude: '',
      frequency_band: 'L1800 / L2100',
      status: 'Active',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (e, site) => {
    e.stopPropagation();
    setEditingSite(site);
    setFormData({
      enb_id: site.enb_id,
      site_name: site.site_name,
      address: site.address,
      latitude: site.latitude,
      longitude: site.longitude,
      frequency_band: site.frequency_band || 'L1800 / L2100',
      status: site.status || 'Active',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleDelete = async (e, site) => {
    e.stopPropagation();
    if (!window.confirm(`Yakin ingin menghapus site ${site.site_name} (${site.enb_id})?`)) {
      return;
    }

    try {
      await sitesApi.delete(site.id);
      setSites((prev) => prev.filter((s) => s.id !== site.id));
    } catch {
      setSites((prev) => prev.filter((s) => s.id !== site.id));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.enb_id || !formData.site_name || !formData.address) {
      setFormError('Harap lengkapi semua field utama.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSite) {
        await sitesApi.update(editingSite.id, formData);
        setSites((prev) =>
          prev.map((s) => (s.id === editingSite.id ? { ...s, ...formData } : s))
        );
      } else {
        const res = await sitesApi.create(formData);
        if (res.success && res.data) {
          setSites((prev) => [res.data, ...prev]);
        } else {
          setSites((prev) => [{ ...formData, id: Date.now() }, ...prev]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data site.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search
  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.site_name?.toLowerCase().includes(search.toLowerCase()) ||
      site.enb_id?.toLowerCase().includes(search.toLowerCase()) ||
      site.address?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || site.status?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <PageTransition className="space-y-6">
      {/* Page Header with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-red-50 text-telkomsel-red">
              <Radio className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Daftar BTS Telkomsel
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoring menara pemancar & infrastruktur jaringan area Semarang & Tembalang
          </p>
        </div>

        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={openCreateModal}
            className="self-start sm:self-auto flex items-center space-x-2 bg-telkomsel-gradient hover:opacity-95 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-md shadow-red-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah BTS Baru</span>
          </motion.button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-card border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama site, eNB ID, atau lokasi..."
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

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
          {[
            { id: 'ALL', label: 'Semua Status' },
            { id: 'Active', label: 'Aktif' },
            { id: 'Maintenance', label: 'Maintenance' },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
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
          <p className="text-sm text-slate-600 font-semibold">Memuat data BTS Telkomsel...</p>
          <p className="text-xs text-slate-400 mt-1">Menghubungkan dengan database telekomunikasi</p>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-6">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-telkomsel-red flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Tidak ada BTS yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tidak ditemukan menara BTS dengan kata kunci "{search}". Coba periksa kembali eNB ID atau status filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('ALL');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredSites.map((site) => {
            const isActive = site.status === 'Active';
            return (
              <motion.div
                key={site.id}
                layout
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => navigate(`/sites/${site.id}`)}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-card hover:shadow-card-hover border border-slate-200/90 hover:border-red-200 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: eNB ID & Status */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-black bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200/80 font-mono">
                      eNB {site.enb_id}
                    </span>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                          : 'bg-amber-50 text-amber-700 border-amber-200/80'
                      }`}
                    >
                      {site.status}
                    </span>
                  </div>

                  {/* Site Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-telkomsel-red transition-colors leading-snug line-clamp-1">
                    {site.site_name}
                  </h3>

                  {/* Address */}
                  <div className="mt-2 flex items-start space-x-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{site.address}</span>
                  </div>
                </div>

                {/* Bottom Meta & Admin Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-telkomsel-red" />
                    <span className="text-[11px] font-semibold text-slate-600">
                      {site.frequency_band || '4G LTE'}
                    </span>
                  </div>

                  {isAdmin ? (
                    <div
                      className="flex items-center space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => openEditModal(e, site)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit BTS"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, site)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus BTS"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-slate-400 group-hover:text-telkomsel-red transition-colors">
                      <span className="text-[11px] font-bold">Detail</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Site (Khusus Admin) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-red-50 text-telkomsel-red">
                    <Radio className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingSite ? 'Edit Data BTS Site' : 'Tambah BTS Site Baru'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      eNB ID (Fiktif 9901xx)
                    </label>
                    <input
                      type="text"
                      value={formData.enb_id}
                      onChange={(e) => setFormData({ ...formData, enb_id: e.target.value })}
                      placeholder="Contoh: 990109"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Site
                    </label>
                    <input
                      type="text"
                      value={formData.site_name}
                      onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                      placeholder="Contoh: TSEL_KRAPYAK_SMG"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Lengkap Tower
                  </label>
                  <textarea
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Alamat penempatan tower BTS..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="-7.050300"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="110.438500"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Frekuensi Band
                    </label>
                    <select
                      value={formData.frequency_band}
                      onChange={(e) => setFormData({ ...formData, frequency_band: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                    >
                      <option value="L1800 / L2100">L1800 / L2100</option>
                      <option value="L900 / L1800">L900 / L1800</option>
                      <option value="L1800 / L2300">L1800 / L2300</option>
                      <option value="L900 / L1800 / L2100">L900 / L1800 / L2100</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status Site
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-telkomsel-gradient hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 disabled:opacity-70 transition-all"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
