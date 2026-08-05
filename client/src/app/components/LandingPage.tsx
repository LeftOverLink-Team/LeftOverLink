import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { UtensilsCrossed, Heart, Users, TrendingDown } from 'lucide-react';
import { Header } from './Header';
import { LiveHeatmap } from '../features/map/LiveHeatmap';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 1000, totalMeals: 5000, totalOrders: 500 });

  useEffect(() => {
    api.get('/analytics/stats').then(res => {
      if (res.data?.success) {
        const d = res.data.data;
        setStats({
          totalUsers: Math.max(d.totalUsers, 1000),
          totalMeals: Math.max(d.totalMeals, 5000),
          totalOrders: Math.max(d.totalOrders, 500),
        });
      }
    }).catch(() => { }); // Silently use defaults
  }, []);

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k+` : `${n}+`;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <UtensilsCrossed className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl mb-6 font-bold tracking-tight">
            Before it spoils,<br />
            <span className="text-green-600">let it serve</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect surplus food from restaurants, homes, and events with those who need it most.
            Every meal saved is a step towards zero waste.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card p-6 rounded-2xl shadow-sm border"
            >
              <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">40%</div>
              <p className="text-muted-foreground">Food wasted daily</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card p-6 rounded-2xl shadow-sm border"
            >
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{fmt(stats.totalUsers)}</div>
              <p className="text-muted-foreground">People helped</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card p-6 rounded-2xl shadow-sm border"
            >
              <Heart className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{fmt(stats.totalMeals)}</div>
              <p className="text-muted-foreground">Meals saved</p>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-bold"
                onClick={() => navigate(user.role === 'provider' ? '/provider' : '/receiver')}
              >
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
                  onClick={() => navigate('/signup?role=provider')}
                >
                  I Have Food to Share
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-6 text-lg"
                  onClick={() => navigate('/signup?role=receiver')}
                >
                  I Need Food
                </Button>
              </div>

              <p className="mt-8 text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-green-600 font-bold hover:underline underline-offset-4"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          id="how-it-works"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-24 max-w-5xl mx-auto scroll-mt-20"
        >
          <h2 className="text-3xl text-center font-bold mb-12">How LeftOverLink Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Post Surplus Food</h3>
              <p className="text-muted-foreground text-sm">
                Restaurants, homes, or events post available food with location and expiry time
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-orange-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find on Map</h3>
              <p className="text-muted-foreground text-sm">
                NGOs, volunteers, and individuals see nearby food on an interactive map
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Pick Up & Save</h3>
              <p className="text-muted-foreground text-sm">
                One tap to reserve, then pick up before it expires. No money, no waste!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Live Heatmap Section */}
        <motion.div
          id="heatmap"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-32 max-w-6xl mx-auto"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Visualizing the <span className="text-green-600">Impact</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our live simulation tracks hotzones where surplus food is frequently wasted versus communities experiencing high demand.
            </p>
          </div>

          <LiveHeatmap />
        </motion.div>

        {/* Donation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 max-w-5xl mx-auto"
        >
          <div className="bg-gradient-to-tr from-green-600 to-green-700 rounded-3xl p-8 md:p-16 text-white text-center shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="p-4 bg-white/10 rounded-full w-fit">
                <Heart className="w-12 h-12 text-white fill-white animate-pulse" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black max-w-2xl mx-auto leading-tight">
                Power the movement to end food waste.
              </h2>
              <p className="text-green-50 text-xl max-w-xl mx-auto opacity-90">
                Join 1000+ donors who contribute to help us coordinate food pickups and support local communities.
              </p>
              <Button
                onClick={() => navigate('/donate')}
                className="bg-white text-green-700 hover:bg-green-50 px-12 h-16 rounded-full text-xl font-black shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Contribute Now
              </Button>
              <p className="text-green-100/60 text-sm">Every ₹1 contributes to 2 meals saved</p>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-black/5 rounded-full blur-3xl group-hover:bg-black/10 transition-colors"></div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          id="features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-24 bg-card rounded-3xl p-8 md:p-12 shadow-lg max-w-5xl mx-auto border scroll-mt-20"
        >
          <h2 className="text-3xl text-center font-bold mb-12">Why Choose LeftOverLink?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="text-green-600 text-2xl">✓</div>
              <div>
                <h4 className="mb-1 font-semibold">Real-Time Updates</h4>
                <p className="text-sm text-muted-foreground">See food availability instantly on the map</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-green-600 text-2xl">✓</div>
              <div>
                <h4 className="mb-1 font-semibold">Location-Based</h4>
                <p className="text-sm text-muted-foreground">Find food near you, reduce travel time</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-green-600 text-2xl">✓</div>
              <div>
                <h4 className="mb-1 font-semibold">Minimal Coordination Fee</h4>
                <p className="text-sm text-muted-foreground">Food is always free — only a small ₹1–₹10 logistics fee applies per pickup</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-green-600 text-2xl">✓</div>
              <div>
                <h4 className="mb-1 font-semibold">Trust System</h4>
                <p className="text-sm text-muted-foreground">Ratings and confirmations build community</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}