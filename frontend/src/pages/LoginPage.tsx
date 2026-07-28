import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import logoImg from '../../assets/Logo.png';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.token) {
        await login(res.token);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/8 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-[#1E272E]/70 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src={logoImg}
              alt="Million Technologies"
              className="w-10 h-10 object-contain rounded-2xl shadow-lg shadow-primary/30"
            />
            <div>
              <h1 className="text-lg font-semibold text-white leading-tight">Million Technologies</h1>
              <p className="text-white/40 text-xs">Admin Dashboard</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-white/50 text-sm mb-8">Sign in to your admin account</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Email address</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-white/20 text-sm outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(26,156,221,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
