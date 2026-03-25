import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Loader2, Leaf, Sparkles, AlertCircle, ArrowRight, User, Shield, Lock, Mail, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'admin' | 'staff'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      login(data.token, data.user);
      
      if (data.user.role === 'admin') navigate('/admin-dashboard');
      else if (data.user.role === 'staff' || data.user.role === 'teacher') navigate('/staff-dashboard');
      else navigate('/student-dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 grid-bg transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <div className="card p-10 md:p-16">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner"
            >
              <Sparkles className="text-primary" size={40} />
            </motion.div>
            <h2 className="text-4xl font-display font-bold text-ink tracking-tight mb-3">
              {isLogin ? 'Welcome Back' : 'Join the Mission'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Sign in to continue to your portal' : 'Create an account to start contributing'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div>
                    <label className="label-text">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="John Doe"
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
                required
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

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

            <div className="mt-12 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold">
                  <span className="bg-card-bg px-4 text-slate-400 transition-colors">Or continue with</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => {
                  const guestUser = {
                    id: 999,
                    name: 'Guest User',
                    email: 'guest@campusclean.edu',
                    role: 'student'
                  };
                  login('guest-token', guestUser as any);
                  navigate('/student');
                }}
                className="btn-secondary w-full"
              >
                <User size={18} />
                Continue as Guest
              </button>

              <p className="text-center text-sm font-medium text-slate-500">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
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
