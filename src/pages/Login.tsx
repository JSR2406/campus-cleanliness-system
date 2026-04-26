import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, AlertCircle, ArrowRight, User, Loader2, Shield, Users, GraduationCap, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGoogleLogin } from '@react-oauth/google';

const DEMO_ACCOUNTS = [
  {
    label: 'Admin',
    icon: Shield,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/20',
    dot: 'bg-emerald-500',
    email: 'admin@campus.com',
    password: 'admin123',
    description: 'Full control & analytics'
  },
  {
    label: 'Staff',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 hover:bg-blue-500/20',
    dot: 'bg-blue-500',
    email: 'staff@campus.com',
    password: 'staff123',
    description: 'Task & maintenance view'
  },
  {
    label: 'Student',
    icon: GraduationCap,
    color: 'bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800 hover:bg-violet-500/20',
    dot: 'bg-violet-500',
    email: 'student@test.com',
    password: 'password123',
    description: 'Report & track issues'
  },
];

// Detect if Google Client ID is configured
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_CONFIGURED = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('placeholder') && !GOOGLE_CLIENT_ID.includes('your_google');

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'admin' | 'staff'>('student');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [guestInfo, setGuestInfo] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const doLogin = async (emailVal: string, passwordVal: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailVal, password: passwordVal }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
  };

  const redirectByRole = (userRole: string) => {
    if (userRole === 'admin') navigate('/admin-dashboard');
    else if (userRole === 'staff' || userRole === 'teacher') navigate('/staff-dashboard');
    else navigate('/student-dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password, role };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');
      login(data.token, data.user);
      redirectByRole(data.user.role);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setDemoLoading(account.label);
    setError('');
    try {
      const data = await doLogin(account.email, account.password);
      login(data.token, data.user);
      redirectByRole(data.user.role);
    } catch (err: any) {
      setError(`Demo login failed: ${err.message}. Make sure the server is running and the DB is seeded (npm run seed).`);
    } finally {
      setDemoLoading(null);
    }
  };

  const handleGuestLogin = () => {
    login('guest-token', {
      id: 999,
      name: 'Guest User',
      email: 'guest@campusclean.edu',
      role: 'student',
      avatar_url: null,
      bio: 'Exploring the Campus Clean platform.',
      phone: null,
    } as any);
    navigate('/student-dashboard');
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const backendRes = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userInfo.name, email: userInfo.email }),
        });
        if (!backendRes.ok) throw new Error('Backend auth failed');
        const data = await backendRes.json();
        login(data.token, data.user);
        redirectByRole(data.user.role);
      } catch {
        setError('Google Sign-In failed. Please try email/password login instead.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Sign-In was cancelled or failed.'),
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 grid-bg transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        {/* Demo Access Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 p-5 bg-card-bg rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-primary" />
            </div>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Demo Access — One Click</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              const isThisLoading = demoLoading === account.label;
              return (
                <motion.button
                  key={account.label}
                  type="button"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDemoLogin(account)}
                  disabled={!!demoLoading}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all disabled:opacity-60 ${account.color}`}
                >
                  {isThisLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Icon size={20} />
                  )}
                  <div>
                    <p className="text-xs font-black tracking-tight">{account.label}</p>
                    <p className="text-[9px] font-medium opacity-70 leading-tight mt-0.5">{account.description}</p>
                  </div>
                  <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${account.dot}`} />
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Login Card */}
        <div className="card p-8 md:p-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner"
            >
              <Sparkles className="text-primary" size={32} />
            </motion.div>
            <h2 className="text-3xl font-display font-bold text-ink tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Join the Mission'}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              {isLogin ? 'Sign in with your credentials' : 'Create an account to start contributing'}
            </p>
          </div>

          {/* autoComplete="off" prevents Chrome from offering to save or breach-check these demo passwords */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <label className="label-text">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="John Doe"
                      autoComplete="off"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label className="label-text">I am a...</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="input-field appearance-none"
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff Member</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label-text">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="name@university.edu"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="label-text">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="pt-2 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold">
                  <span className="bg-card-bg px-4 text-slate-400 transition-colors">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Google Sign-In */}
                {GOOGLE_CONFIGURED ? (
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin()}
                    className="btn-secondary w-full text-sm py-3"
                  >
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setError('Google Sign-In requires VITE_GOOGLE_CLIENT_ID in .env. Use email login or Guest mode instead.')}
                    className="btn-secondary w-full text-sm py-3 opacity-60 relative"
                    title="Requires VITE_GOOGLE_CLIENT_ID in .env"
                  >
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                )}

                {/* Guest Login */}
                <button
                  type="button"
                  onClick={() => setGuestInfo(true)}
                  className="btn-secondary w-full text-sm py-3"
                >
                  <User size={16} className="mr-2 flex-shrink-0" />
                  Guest
                </button>
              </div>

              {/* Guest confirmation banner */}
              <AnimatePresence>
                {guestInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">Guest Mode — Limited Access</p>
                          <p className="text-[11px] text-amber-600/80 leading-relaxed">You can browse dashboards but cannot submit reports or save data. Create a free account to unlock all features.</p>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={handleGuestLogin}
                              className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-[11px] font-bold hover:bg-amber-600 transition-colors"
                            >
                              Continue as Guest
                            </button>
                            <button
                              onClick={() => setGuestInfo(false)}
                              className="px-3 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl text-[11px] font-bold text-amber-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-center text-sm font-medium text-slate-500">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(''); setGuestInfo(false); }}
                  className="text-primary font-bold hover:underline underline-offset-4"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
