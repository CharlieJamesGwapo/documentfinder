import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Users, Pencil, Trash2, Search } from 'lucide-react';
import api from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ROLES = [
  { value: 'user', label: 'User', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
  { value: 'admin', label: 'Admin', color: 'bg-primary/10 text-primary border-primary/30' }
];

const UserManagement = () => {
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'user' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!addForm.firstName || !addForm.lastName || !addForm.email || !addForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    setAdding(true);
    try {
      await api.post('/users', addForm);
      toast.success('User created successfully');
      setShowAddUser(false);
      setAddForm({ firstName: '', lastName: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setAdding(false);
    }
  };

  const handleEditUser = (u) => {
    setEditingUser(u);
    setEditForm({
      firstName: u.firstName || '',
      middleName: u.middleName || '',
      lastName: u.lastName || '',
      suffix: u.suffix || '',
      role: u.role || 'user',
      isActive: u.isActive !== false
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser?.id) return;
    setSaving(true);
    try {
      await api.put(`/users/${editingUser.id}`, editForm);
      toast.success('User updated');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateUser = async (u) => {
    if (u.id === currentUser?.id) {
      toast.error('Cannot deactivate yourself');
      return;
    }

    const result = await Swal.fire({
      title: u.isActive ? 'Deactivate User?' : 'Reactivate User?',
      html: `<p style="color:#94a3b8">${u.isActive ? 'Deactivate' : 'Reactivate'} <strong style="color:#fff">${u.name}</strong>?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: u.isActive ? '#ef4444' : '#e82127',
      cancelButtonColor: '#374151',
      confirmButtonText: u.isActive ? 'Deactivate' : 'Reactivate',
      background: '#1a1b22',
      color: '#fff',
      customClass: { popup: 'border border-white/10 rounded-2xl' }
    });

    if (!result.isConfirmed) return;

    try {
      if (u.isActive) {
        await api.delete(`/users/${u.id}`);
      } else {
        await api.put(`/users/${u.id}`, { isActive: true });
      }
      toast.success(u.isActive ? 'User deactivated' : 'User reactivated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleChangeRole = async (u, newRole) => {
    if (u.id === currentUser?.id) {
      toast.error('Cannot change your own role');
      return;
    }

    try {
      await api.put(`/users/${u.id}`, { role: newRole });
      toast.success(`${u.firstName} is now ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to change role');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  });

  const activeCount = users.filter(u => u.isActive !== false).length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  if (!isAdmin) return null;

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl text-white sm:text-3xl">User Management</h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 active:scale-95 touch-manipulation sm:rounded-2xl sm:px-6 sm:text-sm"
          >
            Add User
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-95 touch-manipulation sm:rounded-2xl sm:px-6 sm:text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border border-white/5 bg-[#15161b] p-3 sm:rounded-2xl sm:p-4">
          <p className="text-2xs uppercase tracking-[0.3em] text-slate-500 sm:text-xs">Total Users</p>
          <p className="mt-1 font-heading text-xl text-white sm:text-2xl">{users.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#15161b] p-3 sm:rounded-2xl sm:p-4">
          <p className="text-2xs uppercase tracking-[0.3em] text-slate-500 sm:text-xs">Active</p>
          <p className="mt-1 font-heading text-xl text-white sm:text-2xl">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#15161b] p-3 sm:rounded-2xl sm:p-4">
          <p className="text-2xs uppercase tracking-[0.3em] text-slate-500 sm:text-xs">Admins</p>
          <p className="mt-1 font-heading text-xl text-primary sm:text-2xl">{adminCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 sm:left-4" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by name, email, or role..."
          className="w-full rounded-xl border border-white/10 bg-[#15161b] pl-9 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none sm:rounded-2xl sm:pl-11 sm:py-3.5"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-white/5 bg-[#14151a] shadow-lg sm:rounded-2xl">
        {loading ? (
          <div className="space-y-3 p-4 sm:p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-500" />
            <p className="mt-3 text-sm text-slate-400">No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="group hover:bg-white/[0.03] transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                            <span className="text-xs font-bold text-primary">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{u.name}</p>
                            {u.id === currentUser?.id && (
                              <span className="text-2xs text-primary">(You)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400">{u.email}</td>
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          disabled={u.id === currentUser?.id}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-transparent focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                            u.role === 'admin'
                              ? 'border-primary/30 text-primary'
                              : 'border-slate-500/30 text-slate-300'
                          }`}
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.isActive !== false
                            ? 'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.isActive !== false ? 'bg-slate-300' : 'bg-red-400'}`} />
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-primary/10 hover:text-primary active:scale-95 touch-manipulation"
                            title="Edit user"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivateUser(u)}
                            disabled={u.id === currentUser?.id}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                            title={u.isActive !== false ? 'Deactivate' : 'Reactivate'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-2 p-3">
              {filteredUsers.map((u) => (
                <div key={u.id} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                        <span className="text-xs font-bold text-primary">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{u.name}</p>
                        <p className="text-2xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex h-2 w-2 rounded-full ${u.isActive !== false ? 'bg-slate-300' : 'bg-red-400'}`} />
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-2xs font-semibold uppercase ${
                        u.role === 'admin' ? 'border-primary/30 text-primary' : 'border-slate-500/30 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                      {u.id === currentUser?.id && (
                        <span className="text-2xs text-primary">(You)</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditUser(u)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary touch-manipulation"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeactivateUser(u)}
                        disabled={u.id === currentUser?.id}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30 touch-manipulation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0e0f13] p-5 text-white shadow-2xl sm:p-6">
            <h3 className="font-heading text-xl text-white mb-4">Edit User</h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1 text-sm">
                  <span className="text-slate-300">First Name</span>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-slate-300">Last Name</span>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              <label className="block space-y-1 text-sm">
                <span className="text-slate-300">Role</span>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  disabled={editingUser.id === currentUser?.id}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none disabled:opacity-50"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  disabled={editingUser.id === currentUser?.id}
                  className="h-4 w-4 rounded border-white/20 bg-black/30 text-primary focus:ring-primary"
                />
                <span className="text-slate-300">Account Active</span>
              </label>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-400 transition hover:text-white touch-manipulation active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={saving}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60 touch-manipulation active:scale-95"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddUser(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0e0f13] p-5 text-white shadow-2xl sm:p-6">
            <h3 className="font-heading text-xl text-white mb-4">Add New User</h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1 text-sm">
                  <span className="text-slate-300">First Name *</span>
                  <input
                    type="text"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First name"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-slate-300">Last Name *</span>
                  <input
                    type="text"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last name"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              <label className="block space-y-1 text-sm">
                <span className="text-slate-300">Email *</span>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-primary focus:outline-none"
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="text-slate-300">Password *</span>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-primary focus:outline-none"
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="text-slate-300">Role</span>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-400 transition hover:text-white touch-manipulation active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={adding}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60 touch-manipulation active:scale-95"
              >
                {adding ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
