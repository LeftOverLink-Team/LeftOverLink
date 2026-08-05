import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, ShoppingBag, Clock, MapPin, Leaf, Award, TrendingUp, Flame, Loader2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { Header } from './Header';
import { ChatDialog } from './ChatDialog';
import { useAuth } from '../context/AuthContext';

export function PickupHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatOrder, setActiveChatOrder] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const endpoint = user?.role === 'provider' ? '/orders/provider' : '/orders/mine';
        const res = await api.get(endpoint);
        // History = completed (payment done) orders
        const completed = (res.data as any[]).filter((o: any) => o.paymentStatus === 'completed' || o.requestStatus === 'accepted');
        setOrders(completed);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [user]);

  // Aggregate impact stats
  const totalMeals = orders.reduce((sum, o) => sum + (o.numberOfMeals || 1), 0);
  const totalCO2 = (totalMeals * 2.5).toFixed(1); // ~2.5kg CO2 per meal
  const totalWater = (totalMeals * 500); // ~500L water per meal saved

  const achievements = [
    { icon: '🌱', name: 'First Save', description: 'Completed your first pickup', earned: orders.length >= 1 },
    { icon: '🌟', name: 'Super Hero', description: 'Saved 10+ meals', earned: totalMeals >= 10 },
    { icon: '🔥', name: 'On Fire', description: 'Saved 50+ meals', earned: totalMeals >= 50 },
    { icon: '🏆', name: 'Legend', description: 'Saved 100+ meals', earned: totalMeals >= 100 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 mt-20 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(user?.role === 'provider' ? '/provider' : '/receiver')}
            className="rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-green-600" />
              My History
            </h1>
            <p className="text-muted-foreground mt-1">Your completed food rescues and impact.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse">Loading your history...</p>
          </div>
        ) : (
          <Tabs defaultValue="history">
            <TabsList className="mb-6 bg-white dark:bg-zinc-900 border rounded-2xl p-1 shadow-sm">
              <TabsTrigger value="history" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="impact" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4" /> Impact
              </TabsTrigger>
              <TabsTrigger value="achievements" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Award className="w-4 h-4" /> Badges
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="history">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-border/50 shadow-sm min-h-[400px]">
                  <div className="w-24 h-24 mb-6 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-green-600 opacity-50" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">No history yet</h2>
                  <p className="text-muted-foreground max-w-md mb-8">Complete your first food pickup to see it here.</p>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-green-600/20 hover:scale-105 transition-all"
                    onClick={() => navigate('/receiver')}
                  >
                    Find Food Near You
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  <AnimatePresence>
                    {orders.map((order, idx) => (
                      <motion.div
                        key={order.id || idx}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4"
                      >
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-bold text-lg">{order.foodType || 'Food Donation'}</h3>
                            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10">
                              {order.paymentStatus === 'completed' ? '✓ Paid' : 'Accepted'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-green-600" />
                              {user?.role === 'provider' ? `Receiver: ${order.receiverName || 'Someone'}` : `Provider: ${order.providerName || 'Anonymous'}`}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5" /> {order.numberOfMeals || 1} meals
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : 'Recently'}
                            </span>
                          </div>
                        </div>
                        <div className="flex md:flex-col gap-2 md:min-w-[140px] justify-end md:justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl gap-1.5 font-semibold"
                            onClick={() => {
                              setActiveChatOrder({ id: order.id, name: user?.role === 'provider' ? order.receiverName : order.providerName });
                              setIsChatOpen(true);
                            }}
                          >
                            <MessageCircle className="w-4 h-4" /> Chat
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            {/* Impact Tab */}
            <TabsContent value="impact">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { icon: <ShoppingBag className="w-8 h-8 text-green-600" />, value: totalMeals, label: 'Meals Rescued', unit: '', bg: 'bg-green-50 dark:bg-green-900/20' },
                  { icon: <Leaf className="w-8 h-8 text-emerald-600" />, value: totalCO2, label: 'CO₂ Prevented', unit: 'kg', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                  { icon: <Flame className="w-8 h-8 text-blue-600" />, value: `${(totalWater / 1000).toFixed(1)}k`, label: 'Litres of Water Saved', unit: 'L', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`${stat.bg} rounded-3xl p-8 text-center border border-border/30`}
                  >
                    <div className="flex justify-center mb-4">{stat.icon}</div>
                    <div className="text-4xl font-black mb-1">{stat.value}{stat.unit}</div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`rounded-2xl p-6 text-center border transition-all ${a.earned
                      ? 'bg-white dark:bg-zinc-900 border-green-200 dark:border-green-800 shadow-md shadow-green-100/50 dark:shadow-green-900/20'
                      : 'bg-muted/30 border-muted opacity-50 grayscale'
                      }`}
                  >
                    <div className="text-4xl mb-3">{a.icon}</div>
                    <h3 className="font-bold mb-1 text-sm">{a.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{a.description}</p>
                    {a.earned && <Badge className="mt-3 bg-green-600 text-white text-[10px]">Earned ✓</Badge>}
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {activeChatOrder && (
        <ChatDialog
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          orderId={activeChatOrder.id}
          providerName={activeChatOrder.name}
        />
      )}
    </div>
  );
}
