import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../lib/api.js';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setFormData({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        suffix: user.suffix || '',
        email: user.email || ''
      });
    }
    setLoading(false);
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('First name and last name are required');
      return;
    }

    setUpdating(true);
    try {
      const { data } = await api.put('/users/profile', formData);
      setProfile(data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setUpdating(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="mt-4 text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl text-white sm:text-4xl">Account Settings</h1>
            <p className="mt-2 text-slate-400">Manage your profile and preferences</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-white/5 bg-[#15161b]/95 p-6 shadow-lg">
              <div className="text-center">
                {profile?.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="mx-auto h-24 w-24 rounded-full border-4 border-primary/30 object-cover"
                  />
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/10">
                    <span className="text-2xl font-bold text-primary">
                      {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </span>
                  </div>
                )}
                <h2 className="mt-4 font-heading text-xl text-white">{profile?.name}</h2>
                <p className="text-sm text-slate-400">{profile?.email}</p>
                <div className="mt-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  {profile?.role}
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-white/5 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Status</span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm font-semibold text-green-400">
                      {profile?.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Member since</span>
                  <span className="text-sm font-semibold text-white">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Last login</span>
                  <span className="text-sm font-semibold text-white">
                    {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 w-full rounded-2xl bg-red-500/10 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Profile Edit Form */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/5 bg-[#15161b]/95 p-6 shadow-lg sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-heading text-xl text-white">Personal Information</h3>
                <button
                  onClick={() => setEditing(!editing)}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm text-slate-300">First name</span>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none"
                        placeholder="First name"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-slate-300">Middle name (optional)</span>
                      <input
                        type="text"
                        value={formData.middleName}
                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                        className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none"
                        placeholder="Middle name"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-slate-300">Last name</span>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none"
                        placeholder="Last name"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-slate-300">Suffix (optional)</span>
                      <input
                        type="text"
                        value={formData.suffix}
                        onChange={(e) => handleInputChange('suffix', e.target.value)}
                        className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none"
                        placeholder="Jr., Sr., PE"
                      />
                    </label>
                  </div>

                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Email</span>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-2xl border border-white/5 bg-black/50 px-4 py-3 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500">Email cannot be changed</p>
                  </label>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={updating}
                    className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-primary/90 disabled:opacity-60"
                  >
                    {updating ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-400">First name</p>
                      <p className="mt-1 text-white">{formData.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Middle name</p>
                      <p className="mt-1 text-white">{formData.middleName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Last name</p>
                      <p className="mt-1 text-white">{formData.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Suffix</p>
                      <p className="mt-1 text-white">{formData.suffix || '—'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="mt-1 text-white">{formData.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Security Section */}
            <div className="mt-6 rounded-3xl border border-white/5 bg-[#15161b]/95 p-6 shadow-lg sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-heading text-xl text-white">Security</h3>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordForm ? (
                <div className="space-y-4">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Current password</span>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none"
                      placeholder="••••••••"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">New password</span>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none"
                      placeholder="••••••••"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Confirm new password</span>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none"
                      placeholder="••••••••"
                    />
                  </label>
                  <button
                    onClick={handleChangePassword}
                    disabled={updating}
                    className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-primary/90 disabled:opacity-60"
                  >
                    {updating ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Keep your account secure by using a strong, unique password.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
