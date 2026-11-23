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
} from 'lucide-react';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FALLBACK_USERS = [
  {
    id: 1,
    username: 'admin',
    full_name: 'Administrator Telkomsel',
    role: 'admin',
    mitra_unit: 'Telkomsel Regional Jateng-DIY',
    is_active: true,
  },
  {
    id: 2,
    username: 'mitra1',
    full_name: 'Mitra Drive Test 1',
    role: 'mitra',
    mitra_unit: 'Mitra Drive Test Semarang',
    is_active: true,
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
      if (editingUser) {
        const payload = {
          full_name: formData.full_name,
          role: formData.role,
          mitra_unit: formData.mitra_unit,
          is_active: formData.is_active,
        };
        if (formData.password) payload.password = formData.password;

        await usersApi.update(editingUser.id, payload);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...payload } : u))
        );
      } else {
        const res = await usersApi.create(formData);
        if (res.success && res.data) {
          setUsers((prev) => [...prev, res.data]);
        } else {
          setUsers((prev) => [...prev, { ...formData, id: Date.now() }]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data pengguna.');
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
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-telkomsel-red" />
            <span>Kelola Akun Pengguna</span>
          </h2>
          <p className="text-[11px] text-slate-500">Khusus Administrator Telkomsel</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-1 bg-telkomsel-red hover:bg-telkomsel-darkred text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Mitra</span>
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
            placeholder="Cari username, nama, atau unit..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center space-x-1.5">
          {[
            { id: 'ALL', label: 'Semua Akun' },
            { id: 'mitra', label: 'Mitra Saja' },
            { id: 'admin', label: 'Admin Saja' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === tab.id
                  ? 'bg-telkomsel-red text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-telkomsel-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Memuat data pengguna...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">Tidak ada akun yang cocok</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredUsers.map((u) => {
            const isSelf = u.id === currentUser?.id;
            return (
              <div
                key={u.id}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/90 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-xs text-slate-900">{u.full_name}</span>
                      {isSelf && (
                        <span className="text-[9px] bg-red-100 text-telkomsel-red font-bold px-1.5 py-0.2 rounded">
                          Anda
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">@{u.username}</p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        u.role === 'admin'
                          ? 'bg-red-50 text-telkomsel-red border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {u.role}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 transition-all ${
                        u.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Klik untuk ubah status aktif"
                    >
                      {u.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      <span>{u.is_active ? 'Aktif' : 'Nonaktif'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1 truncate max-w-[210px]">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{u.mitra_unit || 'Unit Belum Diatur'}</span>
                  </div>

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
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Pengguna */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingUser ? 'Edit Akun Pengguna' : 'Tambah Akun Mitra Baru'}
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
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="mitra2"
                  disabled={!!editingUser}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Budi Santoso"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Password {editingUser && '(Kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="******"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                  required={!editingUser}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Role Akun
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                  >
                    <option value="mitra">Mitra</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Status Akun
                  </label>
                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Unit Kerja / Mitra
                </label>
                <input
                  type="text"
                  value={formData.mitra_unit}
                  onChange={(e) => setFormData({ ...formData, mitra_unit: e.target.value })}
                  placeholder="Mitra Drive Test Semarang"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-telkomsel-red focus:bg-white"
                />
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
