import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { UtensilsCrossed, User, Store, ShieldCheck, Heart, Leaf, Home, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

export function SignupPage() {
  const navigate = useNavigate();
  const { detectLocation } = useLocation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') as 'provider' | 'receiver' | null;

  const [role, setRole] = useState<'provider' | 'receiver'>(roleFromUrl || 'receiver');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect already-logged-in users
  if (user) {
    return <Navigate to={user.role === 'provider' ? '/provider' : '/receiver'} replace />;
  }

  // Auto-suggest @gmail.com when typing a name without '@'
  const emailSuggestion = useMemo(() => {
    if (email && !email.includes('@') && email.trim().length > 0) {
      return `${email}@gmail.com`;
    }
    return '';
  }, [email]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      await api.post('/auth/register', { name, email, password, role });
      toast.success('Account created successfully!');
      navigate(`/login?role=${role}`);
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error?.message || '';
      if (status === 409 || serverMsg.toLowerCase().includes('already in use')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (serverMsg) {
        setError(serverMsg);
      } else {
        setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
      }
      toast.error('Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Top-right Home link */}
      <motion.button
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

      {/* Information Sidebar - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/3 bg-green-600 text-white p-10 flex-col justify-between sticky top-0 h-screen overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">LeftOverLink</span>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-8">
            Be a Hero in<br />
            Your Community.
          </h2>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Share Surplus</h3>
                <p className="text-sm text-green-50/80 leading-relaxed">Connect with people who can use extra food you have.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Save the Planet</h3>
                <p className="text-sm text-green-50/80 leading-relaxed">Reduce food waste and your carbon footprint with every pickup.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Verified Community</h3>
                <p className="text-sm text-green-50/80 leading-relaxed">Join a trusted network of verified NGOs and food providers.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-green-100/60 font-medium tracking-wide">
          © 2026 LEFTOVERLINK. ALL RIGHTS RESERVED.
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      {/* Signup Form Section */}
      <div className="flex-1 p-6 md:p-12 lg:p-20 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-8"
        >
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground mt-2">Join our mission to eliminate food waste</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
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
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Select your role</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('receiver')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${role === 'receiver'
                    ? 'border-green-600 bg-green-500/5 ring-1 ring-green-600/20'
                    : 'border-muted hover:border-muted-foreground/30 bg-muted/20'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${role === 'receiver' ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground group-hover:text-foreground'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold">Receiver</div>
                  <p className="text-[10px] text-muted-foreground text-center">NGOs, Volunteers, Individuals</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${role === 'provider'
                    ? 'border-green-600 bg-green-500/5 ring-1 ring-green-600/20'
                    : 'border-muted hover:border-muted-foreground/30 bg-muted/20'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${role === 'provider' ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground group-hover:text-foreground'}`}>
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold">Provider</div>
                  <p className="text-[10px] text-muted-foreground text-center">Restaurants, Catering, Homes</p>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
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
                    className="h-11"
                    autoComplete="off"
                  />
                  {emailSuggestion && email && !email.includes('@') && (
                    <div className="absolute inset-0 flex items-center pointer-events-none px-3 h-11">
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="p-4 bg-muted/30 border border-muted rounded-xl flex items-start gap-3">
              <div className="p-1.5 bg-background rounded-lg text-green-600">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By creating an account, you agree to our Terms of Service and Privacy Policy. Location access will be used to show nearby food listings.
              </p>
            </div>

            <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-base font-bold transition-all shadow-lg shadow-green-600/20">
              Create My Account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-bold text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                Sign In
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}