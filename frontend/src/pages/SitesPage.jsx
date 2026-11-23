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
} from 'lucide-react';
import { sitesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
      // Fallback data jika backend belum berjalan atau koneksi terputus
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
      // Fallback local delete
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
    <div className="space-y-4">
      {/* Header Bar with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
            <Radio className="w-4 h-4 text-telkomsel-red" />
            <span>Daftar BTS Telkomsel</span>
          </h2>
          <p className="text-[11px] text-slate-500">Area Semarang & Tembalang</p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-1 bg-telkomsel-red hover:bg-telkomsel-darkred text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-sm transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Site</span>
          </button>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/80 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama site atau eNB ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white transition-all"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'Active', label: 'Aktif' },
            { id: 'Maintenance', label: 'Maintenance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-telkomsel-red text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Site List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-8 h-8 border-3 border-telkomsel-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Memuat data BTS Telkomsel...</p>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">Tidak ada BTS yang cocok</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Coba ubah kata kunci pencarian atau filter status.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredSites.map((site) => {
            const isActive = site.status === 'Active';
            return (
              <div
                key={site.id}
                onClick={() => navigate(`/sites/${site.id}`)}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/90 hover:border-red-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                        eNB {site.enb_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {site.status}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-telkomsel-red transition-colors">
                      {site.site_name}
                    </h3>
                  </div>

                  {/* Actions for Admin Only */}
                  {isAdmin ? (
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => openEditModal(e, site)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Site"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, site)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Site"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-telkomsel-red transition-colors" />
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1 truncate max-w-[220px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{site.address}</span>
                  </div>

                  <span className="text-[10px] bg-red-50 text-telkomsel-red font-semibold px-1.5 py-0.5 rounded">
                    {site.frequency_band || '4G LTE'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Site (Khusus Admin) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingSite ? 'Edit Data BTS Site' : 'Tambah BTS Site Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  eNB ID (Fiktif 9901xx)
                </label>
                <input
                  type="text"
                  value={formData.enb_id}
                  onChange={(e) => setFormData({ ...formData, enb_id: e.target.value })}
                  placeholder="Contoh: 990109"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Site
                </label>
                <input
                  type="text"
                  value={formData.site_name}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                  placeholder="Contoh: TSEL_KRAPYAK_SMG"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat penempatan tower BTS"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="-7.050300"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="110.438500"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Frekuensi Band
                  </label>
                  <select
                    value={formData.frequency_band}
                    onChange={(e) => setFormData({ ...formData, frequency_band: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                  >
                    <option value="L1800 / L2100">L1800 / L2100</option>
                    <option value="L900 / L1800">L900 / L1800</option>
                    <option value="L1800 / L2300">L1800 / L2300</option>
                    <option value="L900 / L1800 / L2100">L900 / L1800 / L2100</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Status Site
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-telkomsel-red hover:bg-telkomsel-darkred text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-70"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
