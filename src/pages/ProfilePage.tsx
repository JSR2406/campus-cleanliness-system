import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Phone, FileText, Lock, Camera, CheckCircle,
  AlertCircle, Loader2, Shield, GraduationCap, Briefcase,
  Edit3, Save, X, Sparkles, LogOut, Star
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/8.x/avataaars/svg?seed=campus1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=campus2&backgroundColor=c0aede',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=campus3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=campus4&backgroundColor=ffd5dc',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=campus5&backgroundColor=ffdfbf',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=campus6&backgroundColor=c1f4c5',
];

const ROLE_META: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  admin: { icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Administrator' },
  staff: { icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Staff Member' },
  teacher: { icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Teacher' },
  student: { icon: GraduationCap, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', label: 'Student' },
};

interface ProfileData {
  name: string;
  bio: string;
  phone: string;
  avatar_url: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, updateUser, logout, isGuest, token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    avatar_url: user?.avatar_url || '',
  });
  const [passwords, setPasswords] = useState<PasswordData>({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, rating: 0 });
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch live profile from backend
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || '',
            bio: data.bio || '',
            phone: data.phone || '',
            avatar_url: data.avatar_url || '',
          });
        }
      } catch { /* use cached user data */ }
    };

    // Fetch student stats if applicable
    if (user.role === 'student') {
      const fetchStats = async () => {
        try {
          const res = await fetch('/api/complaints/my', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const complaints = await res.json();
            const resolved = complaints.filter((c: any) => ['Completed', 'Closed'].includes(c.status)).length;
            setStats({
              total: complaints.length,
              resolved,
              pending: complaints.filter((c: any) => c.status === 'Pending').length,
              rating: 4.8,
            });
          }
        } catch { /* ignore */ }
      };
      fetchStats();
    }

    fetchProfile();
  }, [user, token, navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) { setError('Guest users cannot edit their profile. Please create an account.'); return; }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      updateUser(data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) { setError('Guest users cannot change their password.'); return; }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match.'); return;
    }
    if (passwords.newPassword.length < 8) {
      setError('New password must be at least 8 characters.'); return;
    }
    setSavingPwd(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password change failed');
      setSuccess('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSavingPwd(false);
    }
  };

  const roleMeta = ROLE_META[user?.role || 'student'];
  const RoleIcon = roleMeta.icon;

  const avatarDisplay = profile.avatar_url ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundColor=10b981&fontFamily=Helvetica&fontSize=42&fontWeight=700&textColor=ffffff`;

  return (
    <div className="pb-24 lg:pb-12 min-h-screen grid-bg transition-colors duration-300">
      <main className="px-6 py-12 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4 border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">My Account</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ink tracking-tight mb-3">
            Your <span className="text-primary italic">Profile</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage your account, preferences and security settings.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="card p-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-[2rem]" />

              {/* Avatar */}
              <div className="relative mt-4 mb-6 z-10">
                <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                  <img src={avatarDisplay} alt="Avatar" className="w-full h-full object-cover bg-primary/10" />
                </div>
                {!isGuest && (
                  <button
                    onClick={() => setShowAvatarPicker(true)}
                    className="absolute -bottom-2 -right-2 w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform"
                  >
                    <Camera size={16} className="text-white" />
                  </button>
                )}
              </div>

              <h2 className="text-2xl font-display font-bold text-ink mb-1">{user?.name}</h2>
              <p className="text-sm text-slate-400 font-medium mb-4">{user?.email}</p>

              <div className={`inline-flex items-center gap-2 px-4 py-2 ${roleMeta.bg} rounded-xl mb-6`}>
                <RoleIcon size={14} className={roleMeta.color} />
                <span className={`text-xs font-bold ${roleMeta.color} uppercase tracking-widest`}>{roleMeta.label}</span>
              </div>

              {profile.bio && (
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 text-left w-full">
                  {profile.bio}
                </p>
              )}

              {/* Stats for students */}
              {user?.role === 'student' && (
                <div className="grid grid-cols-3 gap-3 w-full mt-2">
                  {[
                    { label: 'Reports', value: stats.total, color: 'text-blue-500' },
                    { label: 'Resolved', value: stats.resolved, color: 'text-emerald-500' },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-500' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3">
                      <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {isGuest && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={14} className="text-amber-600" />
                    <span className="text-xs font-bold text-amber-600">Guest Session</span>
                  </div>
                  <p className="text-xs text-amber-600/80 font-medium">Create a free account to save your profile and reports.</p>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="mt-3 w-full py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              )}

              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all font-bold text-sm"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* Edit Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {(['profile', 'security'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab === 'profile' ? 'Profile Info' : 'Security'}
                </button>
              ))}
            </div>

            {/* Success / Error */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 text-sm font-bold flex items-center gap-3"
                >
                  <CheckCircle size={18} /> {success}
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3"
                >
                  <AlertCircle size={18} /> {error}
                  <button onClick={() => setError('')} className="ml-auto"><X size={16} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Edit3 size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-ink">Edit Profile</h3>
                    <p className="text-xs text-slate-400 font-medium">Update your personal information</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label className="label-text">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                        className="input-field pl-11"
                        placeholder="Your full name"
                        disabled={isGuest}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label-text">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="input-field pl-11 opacity-60 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 ml-1">Email cannot be changed for security reasons.</p>
                  </div>

                  <div>
                    <label className="label-text">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                        className="input-field pl-11"
                        placeholder="+91 98765 43210"
                        disabled={isGuest}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label-text">Bio <span className="text-slate-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <FileText size={16} className="absolute left-4 top-4 text-slate-400" />
                      <textarea
                        value={profile.bio}
                        onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                        className="input-field pl-11 min-h-[100px] resize-none"
                        placeholder="Tell us about yourself..."
                        maxLength={200}
                        disabled={isGuest}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 ml-1">{profile.bio.length}/200 characters</p>
                  </div>

                  <button
                    type="submit"
                    disabled={saving || isGuest}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                    <Lock size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-ink">Change Password</h3>
                    <p className="text-xs text-slate-400 font-medium">Minimum 8 characters required</p>
                  </div>
                </div>

                {isGuest ? (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                    <Sparkles className="mx-auto mb-3 text-slate-300" size={32} />
                    <p className="text-sm font-bold text-slate-500">Guest accounts don't have passwords.</p>
                    <p className="text-xs text-slate-400 mt-1">Sign up for a real account to set a password.</p>
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors"
                    >
                      Create Account
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    {[
                      { label: 'Current Password', key: 'currentPassword', placeholder: '••••••••' },
                      { label: 'New Password', key: 'newPassword', placeholder: 'Min 8 characters' },
                      { label: 'Confirm New Password', key: 'confirmPassword', placeholder: 'Repeat new password' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="label-text">{field.label}</label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="password"
                            value={passwords[field.key as keyof PasswordData]}
                            onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                            className="input-field pl-11"
                            placeholder={field.placeholder}
                            required
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="submit"
                      disabled={savingPwd}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {savingPwd ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                      {savingPwd ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAvatarPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card-bg rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-ink">Choose Avatar</h3>
                <button onClick={() => setShowAvatarPicker(false)} className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {AVATAR_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setProfile(p => ({ ...p, avatar_url: url }));
                      setShowAvatarPicker(false);
                    }}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      profile.avatar_url === url ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i + 1}`} className="w-full aspect-square object-cover bg-slate-50" />
                    {profile.avatar_url === url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircle size={24} className="text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const initials = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundColor=10b981&fontFamily=Helvetica&fontSize=42&fontWeight=700&textColor=ffffff`;
                  setProfile(p => ({ ...p, avatar_url: initials }));
                  setShowAvatarPicker(false);
                }}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Use Initials Avatar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
