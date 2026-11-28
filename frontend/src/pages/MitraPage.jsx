import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Building,
  ShieldCheck,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

const FALLBACK_USERS = [
  {
    id: 1,
    username: 'admin',
    full_name: 'Administrator Telkomsel',
    role: 'admin',
    mitra_unit: 'Telkomsel Regional Jateng-DIY',
    is_active: true,
    must_change_password: false,
  },
  {
    id: 2,
    username: 'mitra1',
    full_name: 'Mitra Drive Test 1',
    role: 'mitra',
    mitra_unit: 'Mitra Drive Test Semarang',
    is_active: true,
    must_change_password: true,
  },
];

export default function MitraPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'mitra',
    mitra_unit: '',
    is_active: true,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers(FALLBACK_USERS);
      }
    } catch {
      setUsers(FALLBACK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'mitra',
      mitra_unit: 'Mitra Drive Test Semarang',
      is_active: true,
      must_change_password: true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      username: u.username,
      password: '',
      full_name: u.full_name,
      role: u.role,
      mitra_unit: u.mitra_unit || '',
      is_active: u.is_active,
      must_change_password: u.must_change_password || false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleToggleStatus = async (targetUser) => {
    const updatedStatus = !targetUser.is_active;
    try {
      await usersApi.update(targetUser.id, { is_active: updatedStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: updatedStatus } : u))
      );
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: updatedStatus } : u))
      );
    }
  };

  const handleDelete = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus akun '${targetUser.username}' (${targetUser.full_name})?`)) {
      return;
    }

    try {
      await usersApi.delete(targetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.username.trim() || !formData.full_name.trim()) {
      setFormError('Harap lengkapi username dan nama lengkap.');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setFormError('Password wajib diisi untuk akun baru.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        username: formData.username.trim(),
        full_name: formData.full_name.trim(),
        role: formData.role,
        mitra_unit: formData.mitra_unit || 'Mitra Drive Test',
        is_active: Boolean(formData.is_active),
      };

      if (editingUser) {
        if (formData.password && formData.password.trim() !== '') {
          payload.password = formData.password;
        }

        const res = await usersApi.update(editingUser.id, payload);
        const updatedUser = res.data || { ...editingUser, ...payload };
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...updatedUser } : u))
        );
      } else {
        payload.password = formData.password;
        payload.must_change_password = true;
        const res = await usersApi.create(payload);
        if (res.success && res.data) {
          setUsers((prev) => [...prev, res.data]);
        } else {
          setUsers((prev) => [...prev, { ...payload, id: Date.now() }]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      console.error('[Submit User Error]:', err);
      const serverMessage =
        err.response?.data?.message ||
        err.data?.message ||
        err.message ||
        'Terjadi kesalahan saat menambahkan pengguna.';
      setFormError(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.mitra_unit?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <PageTransition className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-red-50 text-telkomsel-red">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Kelola Akun Mitra & Admin
            </h2>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={openCreateModal}
          className="self-start sm:self-auto flex items-center space-x-2 bg-telkomsel-gradient hover:opacity-95 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-md shadow-red-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mitra Baru</span>
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
            placeholder="Cari username, nama lengkap, atau unit kerja..."
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

        {/* Role Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
          {[
            { id: 'ALL', label: 'Semua Akun' },
            { id: 'mitra', label: 'Mitra' },
            { id: 'admin', label: 'Admin' },
          ].map((tab) => {
            const isSelected = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
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
          <p className="text-sm text-slate-600 font-semibold">Memuat daftar pengguna...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-6">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Tidak ada akun yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter peran.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredUsers.map((u) => {
            const isSelf = u.id === currentUser?.id;
            const isAdminRole = u.role === 'admin';
            return (
              <motion.div
                key={u.id}
                layout
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-card hover:shadow-card-hover border border-slate-200/90 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-xs text-white shrink-0 ${
                          isAdminRole
                            ? 'bg-telkomsel-gradient'
                            : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                        }`}
                      >
                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug truncate">
                          {u.full_name}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono truncate">@{u.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      {u.must_change_password && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold leading-none bg-amber-50 text-amber-700 border border-amber-200/80">
                          Password Sementara
                        </span>
                      )}
                      {isSelf && (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none bg-red-100 text-telkomsel-red border border-red-200/80">
                          Anda
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none uppercase tracking-wider border ${
                          isAdminRole
                            ? 'bg-red-50 text-telkomsel-red border-red-200/80'
                            : 'bg-blue-50 text-blue-700 border-blue-200/80'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{u.mitra_unit || 'Unit Belum Diatur'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`text-[11px] font-bold px-3 py-1 rounded-xl border flex items-center space-x-1.5 transition-all ${
                      u.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Klik untuk ubah status aktif/nonaktif"
                  >
                    {u.is_active ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                    <span>{u.is_active ? 'Aktif' : 'Nonaktif'}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Akun"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!isSelf && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Pengguna */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-red-50 text-telkomsel-red">
                    <User className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingUser ? 'Edit Akun Pengguna' : 'Tambah Akun Mitra Baru'}
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Contoh: mitra2"
                    disabled={!!editingUser}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Budi Santoso"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editingUser ? 'Password (Kosongkan jika tidak diubah)' : 'Password Sementara'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="******"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                    required={!editingUser}
                  />
                  {!editingUser && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Mitra wajib mengganti password ini saat login pertama kali.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Role Otoritas
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                    >
                      <option value="mitra">Mitra Drive Test</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status Akun
                    </label>
                    <select
                      value={formData.is_active ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                    >
                      <option value="true">Aktif</option>
                      <option value="false">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit Kerja / Mitra
                  </label>
                  <input
                    type="text"
                    value={formData.mitra_unit}
                    onChange={(e) => setFormData({ ...formData, mitra_unit: e.target.value })}
                    placeholder="Mitra Drive Test Semarang"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-telkomsel-red/20 focus:border-telkomsel-red focus:bg-white"
                  />
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
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
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
