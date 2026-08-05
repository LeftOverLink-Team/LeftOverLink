import { useState, useMemo } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router';
import { useLocation } from '../hooks/useLocation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { UtensilsCrossed, Home } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { detectLocation } = useLocation();
  const { login, user } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('reason') === 'session';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Auto-suggest @gmail.com — MUST be declared before any early returns (Rules of Hooks)
  const emailSuggestion = useMemo(() => {
    if (email && !email.includes('@') && email.trim().length > 0) {
      return `${email}@gmail.com`;
    }
    return '';
  }, [email]);

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to={user.role === 'provider' ? '/provider' : '/receiver'} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.token;
      const user = res.data.user;

      if (!token) throw new Error('No token in response');

      const role = user.role || 'receiver';
      login({ id: user._id || user.id, name: user.name, role }, token);
      detectLocation(true);
      toast.success('Login successful!');
      navigate(role === 'provider' ? '/provider' : '/receiver');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Login failed';
      if (errorMsg.includes('Invalid') || errorMsg.includes('password') || errorMsg.includes('email') || err.response?.status === 400 || err.response?.status === 401) {
        setError('This email or password is incorrect. Please try again.');
      } else {
        setError(errorMsg);
      }
      toast.error('Login failed');
    }
  };

  const handleGoogleLogin = () => {
    // Mock Google login - show error instead since real OAuth not available
    toast.error('Google login not configured', {
      description: 'Please use email/password login or set up OAuth'
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background relative">
      {/* Top-right Home link */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="absolute top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 shadow-2xl shadow-green-900/10 hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-green-700 transition-colors font-bold overflow-hidden group"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        <Home className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
        <span className="relative z-10 tracking-wide pr-1">Return Home</span>
      </motion.button>

      {/* Left Side: Branding & Info (Hidden on small screens) */}
      <div className="hidden md:flex md:w-1/2 bg-green-600 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">LeftOverLink</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Feed Communities,<br />
              <span className="text-green-200">Reduce Waste.</span>
            </h1>
            <p className="text-lg text-green-50/90 max-w-md leading-relaxed">
              Join thousands of people and businesses sharing surplus food with those who need it most.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-8 border-t border-white/20 pt-8">
            <div>
              <div className="text-3xl font-bold mb-1">50k+</div>
              <div className="text-sm text-green-100/80">Meals Rescued</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">10k+</div>
              <div className="text-sm text-green-100/80">Active Heroes</div>
            </div>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 -right-24 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center md:text-left">
            <div className="md:hidden flex justify-center mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <UtensilsCrossed className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Enter your details to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {sessionExpired && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-3 text-amber-700 dark:text-amber-400"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">Your session expired or was invalid — please sign in again.</p>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === 'Tab' || e.key === 'ArrowRight') && emailSuggestion) {
                      e.preventDefault();
                      setEmail(emailSuggestion);
                    }
                  }}
                  required
                  className="h-12"
                  autoComplete="off"
                />
                {emailSuggestion && email && !email.includes('@') && (
                  <div className="absolute inset-0 flex items-center pointer-events-none px-3 h-12">
                    <span className="invisible">{email}</span>
                    <span className="text-muted-foreground/40 select-none">@gmail.com</span>
                  </div>
                )}
              </div>
              {email && !email.includes('@') && (
                <p className="text-[11px] text-muted-foreground/60 mt-1 ml-1">Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono border border-muted-foreground/20">Tab</kbd> to complete @gmail.com</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                className="h-12"
              />
            </div>

            <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-base font-semibold transition-all">
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-semibold text-green-600 hover:text-green-700 hover:underline underline-offset-4"
            >
              Create Account
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}