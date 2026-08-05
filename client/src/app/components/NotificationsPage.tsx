import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Clock, MapPin, CheckCircle, AlertCircle, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Header } from './Header';
import api from '../api/axios';

interface Notification {
  id: string;
  type: 'nearby' | 'expiring' | 'pickup' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionable?: boolean;
  link?: string;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        setError('Could not load notifications. Check your connection.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllAsRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const deleteNotification = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  const getIcon = (type: string) => {
    switch (type) {
      case 'nearby': return <MapPin className="w-5 h-5 text-green-600" />;
      case 'expiring': return <Clock className="w-5 h-5 text-red-600" />;
      case 'pickup': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default: return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const NotificationCard = ({ n }: { n: Notification }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
    >
      <Card
        className={`p-4 cursor-pointer transition-colors ${!n.read ? 'bg-green-500/10 border-green-500/20 dark:border-green-800/30' : 'hover:bg-muted/40'}`}
        onClick={() => markAsRead(n.id)}
      >
        <div className="flex gap-3">
          <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight">{n.title}</h3>
                {!n.read && <Badge className="bg-green-600 text-[10px] px-1.5 py-0 shrink-0">New</Badge>}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                className="text-muted-foreground/40 hover:text-red-500 transition-colors shrink-0"
                aria-label="Delete notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
            <p className="text-xs text-muted-foreground/50 mt-1.5">{n.time}</p>

            {n.actionable && n.link && !n.read && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 h-8 text-xs px-3"
                  onClick={(e) => { e.stopPropagation(); navigate(n.link!); }}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs px-3"
                  onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const EmptyState = ({ label }: { label: string }) => (
    <Card className="p-10 text-center bg-card border-dashed">
      <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
      <p className="text-muted-foreground text-sm">{label}</p>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 mt-20">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-black flex items-center gap-2">
                <Bell className="w-6 h-6 text-green-600" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-xs">{unreadCount}</Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Updates from your food activity</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-sm shrink-0">
              Mark all read
            </Button>
          )}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center border-red-200 bg-red-50 dark:bg-red-900/10">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-4">
              <TabsTrigger value="all">
                All {unreadCount > 0 && <Badge className="ml-1.5 bg-red-500 text-[10px] px-1.5">{unreadCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="nearby">Nearby</TabsTrigger>
              <TabsTrigger value="pickups">Pickups</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              <AnimatePresence mode="popLayout">
                {notifications.length === 0
                  ? <EmptyState label="No notifications yet — start using the app to see activity here." />
                  : notifications.map(n => <NotificationCard key={n.id} n={n} />)
                }
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="nearby" className="space-y-2">
              <AnimatePresence mode="popLayout">
                {notifications.filter(n => n.type === 'nearby').length === 0
                  ? <EmptyState label="No nearby alerts" />
                  : notifications.filter(n => n.type === 'nearby').map(n => <NotificationCard key={n.id} n={n} />)
                }
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="pickups" className="space-y-2">
              <AnimatePresence mode="popLayout">
                {notifications.filter(n => n.type === 'pickup' || n.type === 'expiring').length === 0
                  ? <EmptyState label="No pickup updates" />
                  : notifications.filter(n => n.type === 'pickup' || n.type === 'expiring').map(n => <NotificationCard key={n.id} n={n} />)
                }
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="system" className="space-y-2">
              <AnimatePresence mode="popLayout">
                {notifications.filter(n => n.type === 'system').length === 0
                  ? <EmptyState label="No system messages" />
                  : notifications.filter(n => n.type === 'system').map(n => <NotificationCard key={n.id} n={n} />)
                }
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
