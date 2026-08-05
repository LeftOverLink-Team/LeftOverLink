import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
    UtensilsCrossed,
    MapPin,
    Clock,
    Search,
    History,
    Bell,
    User as UserIcon,
    LogOut,
    Leaf,
    Calendar,
    Star,
    CreditCard,
    Smartphone,
    Landmark,
    Wallet,
    Banknote,
    ChevronLeft,
    Building,
    Building2,
    UserCheck,
    CheckCircle2,
    AlertCircle,
    IndianRupee,
    Trash2,
    Maximize2,
    X,
    ShoppingBag,
    Send,
    MessageCircle
} from 'lucide-react';
import { getTimeLeft, calculateDistance, calculateUrgency } from '../mockData';
import api from '../api/axios';
import { FoodPost, PaymentMethod, PaymentRecord } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from '../hooks/useLocation';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { FoodMap } from '../features/map/FoodMap';
import { InsightBanner } from '../features/insights/InsightBanner';
import { getReceiverInsights } from '../shared/ai/insightEngine';
import { PickupDialog } from '../../features/receiver/PickupDialog';
import { FoodList } from '../../features/receiver/FoodList';
import { ChatDialog } from './ChatDialog';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export function ReceiverDashboard() {
    const { user, logout, isLoading: isAuthLoading } = useAuth();
    const { settings: userSettings, updateSettings: setUserSettings, isLoading: isSettingsLoading } = useSettings();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | 'veg' | 'non-veg' | 'vegan' | 'mixed'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isChangingLocation, setIsChangingLocation] = useState(false);
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [tempAddress, setTempAddress] = useState('');
    const { detectLocation, watchLocation, isDetecting: isLocationDetecting, permissionStatus } = useLocation();

    // Pickup Flow States
    const [selectedFood, setSelectedFood] = useState<FoodPost | null>(null);
    const [existingOrder, setExistingOrder] = useState<any>(null);
    const [isPickupDialogOpen, setIsPickupDialogOpen] = useState(false);

    // Chat States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatOrder, setChatOrder] = useState<any>(null);

    // Pickup history will be loaded from API when available; start empty
    const [pickupHistory, setPickupHistory] = useState<any[]>([]);
    // Track expired food cards user has removed from view, persisted so they don't reappear on reload
    // Track expired food cards user has removed from view, persisted so they don't reappear on reload
    const [removedPostIds, setRemovedPostIds] = useState<Set<string>>(new Set());
    const [hasLoadedRemovedPosts, setHasLoadedRemovedPosts] = useState(false);

    useEffect(() => {
        if (user?.id) {
            try {
                const saved = localStorage.getItem(`removed_posts_${user.id}`);
                if (saved) {
                    setRemovedPostIds(new Set(JSON.parse(saved)));
                }
            } catch (e) {
                console.error("Failed to parse removed posts", e);
            } finally {
                setHasLoadedRemovedPosts(true);
            }
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id && hasLoadedRemovedPosts) {
            localStorage.setItem(`removed_posts_${user.id}`, JSON.stringify(Array.from(removedPostIds)));
        }
    }, [removedPostIds, user?.id, hasLoadedRemovedPosts]);

    useEffect(() => {
        if (!isAuthLoading) {
            if (!user) navigate('/login');
            else if (user.role !== 'receiver') navigate('/provider');
        }
    }, [user, isAuthLoading, navigate]);

    useEffect(() => {
        if (isSettingsLoading) return;

        // Auto-detect if enabled and no coordinates present
        if (userSettings.autoLocation && (!userSettings.lat || !userSettings.lng || userSettings.lat === 0 || userSettings.lng === 0)) {
            handleAutoDetect(true);
        }

        // Setup watcher for movement
        const watchId = watchLocation((coords) => {
            if (coords.lat && coords.lng) {
                setUserSettings({ lat: coords.lat, lng: coords.lng });
            }
        });

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [isSettingsLoading, userSettings.autoLocation]); // Updated dependencies

    const handleAutoDetect = async (silent = false) => {
        const location = await detectLocation(silent);
        if (location) {
            setUserSettings({
                lat: location.lat,
                lng: location.lng,
                address: location.address
            });
            if (!silent) toast.success('Location detected');
        }
    };

    const handleManualLocation = () => {
        if (!tempAddress.trim()) return;
        setUserSettings({
            address: tempAddress,
            lat: 0,
            lng: 0,
            autoLocation: false
        });
        setIsChangingLocation(false);
        toast.success(`Location set to ${tempAddress}`);
    };

    const [foods, setFoods] = useState<FoodPost[]>([]);

    const fetchFoods = async () => {
        try {
            const res = await api.get('/food');
            // Transform backend data to frontend FoodPost format
            const transformedFoods = res.data.map((food: any) => {
                const expiryTime = new Date(food.expiry);
                return {
                    id: food._id,
                    providerId: food.provider?._id || food.provider,
                    providerName: food.provider?.name || 'Unknown Provider',
                    providerRating: food.provider?.rating,
                    foodType: food.title,
                    isVeg: true, // Backend doesn't have this, defaulting to true
                    dietaryType: 'mixed' as const,
                    quantity: food.quantity,
                    description: food.description,
                    expiryTime,
                    location: {
                        lat: food.location?.lat || 0,
                        lng: food.location?.lng || 0,
                        address: food.location?.address || 'Unknown Location',
                    },
                    status: (food.status || 'available') as any,
                    imageUrl: food.imageUrl,
                    distance: null,
                    urgency: calculateUrgency(expiryTime),
                };
            });
            setFoods(transformedFoods);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFoods();

        // Refetch every 5 seconds to catch new posts from providers
        const interval = setInterval(() => {
            console.log('Auto-refetching receiver foods...');
            fetchFoods();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const filteredPosts = foods
        .filter(post => {
            if (removedPostIds.has(post.id)) return false;
            // Only show available foods
            if (post.status !== 'available') return false;

            // Do not show expired food
            if (new Date() > new Date(post.expiryTime)) return false;

            const hasCoordinates = Number.isFinite(post.location?.lat) && Number.isFinite(post.location?.lng) && !(post.location.lat === 0 && post.location.lng === 0);
            const hasAddress = typeof post.location?.address === 'string' && post.location.address.trim().length > 0;

            // Accept posts that have either coordinates or a readable address.
            if (!hasCoordinates && !hasAddress) {
                return false;
            }

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return post.foodType.toLowerCase().includes(query) ||
                    post.providerName.toLowerCase().includes(query) ||
                    (post.location?.address || '').toLowerCase().includes(query);
            }
            if (filter !== 'all' && post.dietaryType !== filter) return false;

            if (userSettings?.autoLocation && userSettings?.lat && userSettings?.lng && userSettings.lat !== 0 && userSettings.lng !== 0 && hasCoordinates) {
                const distance = calculateDistance(userSettings.lat, userSettings.lng, post.location.lat, post.location.lng);
                return distance <= parseFloat(userSettings.alertRadius || '10');
            }
            return true;
        })
        .map(post => {
            let distance: number | null = null;
            if (userSettings?.lat && userSettings?.lng && userSettings.lat !== 0 && userSettings.lng !== 0 && Number.isFinite(post.location?.lat) && Number.isFinite(post.location?.lng) && !(post.location.lat === 0 && post.location.lng === 0)) {
                distance = calculateDistance(userSettings.lat, userSettings.lng, post.location.lat, post.location.lng);
            }
            return { ...post, distance } as (FoodPost & { distance: number | null });
        })
        .sort((a, b) => {
            // Primarily sort by distance (closest first)
            if (a.distance !== null && b.distance !== null) {
                return a.distance - b.distance;
            }
            // If only one has distance, prioritize it
            if (a.distance !== null) return -1;
            if (b.distance !== null) return 1;
            // Fallback to posted date (newest first)
            // postedAt may not be set on transformed objects; use expiryTime as a stable fallback
            const aTime = typeof a.expiryTime === 'number' ? a.expiryTime : a.expiryTime.getTime();
            const bTime = typeof b.expiryTime === 'number' ? b.expiryTime : b.expiryTime.getTime();
            return bTime - aTime;
        });

    const insights = getReceiverInsights(foods);

    const handleLogout = () => {
        logout();
    };

    // Handlers mapped to PickupDialog

    const handleSelectPost = async (post: FoodPost) => {
        try {
            await api.post(`/food/${post.id}/view`);
        } catch (error) {
            console.error('Failed to increment view count', error);
        }

        try {
            const res = await api.get('/orders/mine');
            const orders: any[] = res.data;
            const foundOrder = orders.find((i: any) =>
                i.foodPostId === post.id &&
                (i.requestStatus === 'pending' || (i.requestStatus === 'accepted' && i.paymentStatus === 'pending'))
            );
            setExistingOrder(foundOrder || null);
        } catch {
            setExistingOrder(null);
        }

        setSelectedFood(post as any);
        setIsPickupDialogOpen(true);
    };

    const handleContinuePayment = (order: any, foodPost: FoodPost) => {
        setExistingOrder(order);
        setSelectedFood(foodPost);
        setIsPickupDialogOpen(true);
    };

    const handleOpenChat = (order: any) => {
        setChatOrder(order);
        setIsChatOpen(true);
    };

    const handleClaim = async (id: string) => {
        try {
            await api.put(`/food/claim/${id}`);
            fetchFoods();
            toast.success('Food claimed');
        } catch (err) {
            console.error(err);
            toast.error('Claim failed');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-background border-b px-4 py-3 sticky top-0 z-10">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600 font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>
                        <UtensilsCrossed className="w-8 h-8" />
                        <span>LeftOverLink <Badge variant="outline" className="ml-2 text-xs">Receiver</Badge></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white font-bold gap-2 px-3 h-9 shadow-sm"
                            onClick={() => navigate('/my-orders')}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span className="hidden sm:inline">My Orders</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 font-bold gap-2 px-3 h-9"
                            onClick={() => navigate('/wallet')}
                        >
                            <Wallet className="w-4 h-4" />
                            <span className="hidden sm:inline">Wallet</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')}>
                            <Bell className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                            <UserIcon className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="w-5 h-5 text-red-500" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-6">
                <Tabs defaultValue="nearby" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
                        <TabsTrigger value="nearby" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Nearby Food
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="w-4 h-4" /> Pickup History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="nearby" className="space-y-6">
                        {permissionStatus === 'denied' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-4"
                            >
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold text-amber-900 text-sm">Location Access Required</h5>
                                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                        For better results, please enable location access in your browser settings.
                                        Alternatively, you can manually enter your city below.
                                    </p>
                                </div>
                                <Button
                                    variant="link"
                                    className="text-amber-700 text-xs font-bold underline"
                                    onClick={() => setIsChangingLocation(true)}
                                >
                                    Manually Set
                                </Button>
                            </motion.div>
                        )}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">Food Near You</h2>
                                {userSettings?.address && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {userSettings.address}
                                        </p>
                                        <Button variant="link" size="sm" className="h-auto p-0 text-green-600" onClick={() => setIsChangingLocation(!isChangingLocation)}>
                                            Change
                                        </Button>
                                    </div>
                                )}
                                {isChangingLocation && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="text"
                                            value={tempAddress}
                                            onChange={(e) => setTempAddress(e.target.value)}
                                            placeholder="Enter location..."
                                            className="text-sm px-3 py-1.5 border rounded-md bg-background w-64 focus:ring-2 focus:ring-green-500 outline-none"
                                            onKeyDown={(e) => e.key === 'Enter' && handleManualLocation()}
                                        />
                                        <Button size="sm" onClick={handleManualLocation}>Save</Button>
                                    </div>
                                )}

                                {/* Live Alerts Section */}
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-red-600 animate-pulse uppercase tracking-wider">
                                        <Bell className="w-3 h-3" />
                                        Live Alerts Near You
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {filteredPosts.slice(0, 2).map(post => (
                                            <div key={post.id} className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 p-2 rounded-lg flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                        <UtensilsCrossed className="w-4 h-4 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold leading-tight">{post.foodType}</p>
                                                        <p className="text-[10px] text-muted-foreground">{post.distance ? `${post.distance.toFixed(1)}km away` : 'Nearby'}</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleSelectPost(post)}>
                                                    View
                                                </Button>
                                            </div>
                                        ))}
                                        {filteredPosts.length === 0 && (
                                            <p className="text-[10px] text-muted-foreground italic">No active alerts in your immediate area.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search food or providers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>

                        <InsightBanner insights={insights} />

                        <div className="flex gap-4 mb-4">
                            <Button
                                variant="outline"
                                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-bold gap-2 px-6 h-12 rounded-xl shadow-sm w-full md:w-auto"
                                onClick={() => navigate('/directory')}
                            >
                                <Building2 className="w-5 h-5" />
                                Organisation Directory
                            </Button>
                        </div>

                        {/* Interactive Map Section */}
                        {!isPickupDialogOpen && (
                            <div className="relative w-full mb-6">
                                {!isMapExpanded ? (
                                    <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border border-border/50 shadow-sm group cursor-pointer" onClick={() => setIsMapExpanded(true)}>
                                        <div className="absolute inset-0 bg-background/5 backdrop-blur-[2px] z-10 transition-colors group-hover:bg-background/0"></div>
                                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                            <Button variant="default" className="shadow-2xl scale-110 pointer-events-auto bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-6 font-bold flex items-center gap-2 group-hover:scale-125 transition-transform" onClick={(e) => {
                                                e.stopPropagation();
                                                setIsMapExpanded(true);
                                                window.dispatchEvent(new CustomEvent('map_expanded', { detail: true }));
                                            }}>
                                                <Maximize2 className="w-5 h-5" />
                                                Tap to View Full Map
                                            </Button>
                                        </div>
                                        <FoodMap
                                            centerLat={userSettings?.lat}
                                            centerLng={userSettings?.lng}
                                            receiverLat={userSettings?.lat}
                                            receiverLng={userSettings?.lng}
                                            receiverName={user?.name || 'Receiver'}
                                            posts={filteredPosts}
                                            onSelectPost={() => { }} // Disabled in preview
                                        />
                                    </div>
                                ) : (
                                    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center pb-safe">
                                        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-background/80 to-transparent z-[110] pointer-events-none" />
                                        <Button
                                            variant="default"
                                            size="icon"
                                            onClick={() => {
                                                setIsMapExpanded(false);
                                                window.dispatchEvent(new CustomEvent('map_expanded', { detail: false }));
                                            }}
                                            className="absolute top-6 left-6 z-[120] rounded-full shadow-xl bg-red-600 hover:bg-red-700 border-2 border-red-500 hover:border-red-400 group transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                        >
                                            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                                        </Button>
                                        <div className="w-full h-full p-[2px] bg-gradient-to-br from-green-500/20 via-transparent to-green-500/20">
                                            <div className="w-full h-full bg-background overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.1)]">
                                                <FoodMap
                                                    centerLat={userSettings?.lat}
                                                    centerLng={userSettings?.lng}
                                                    receiverLat={userSettings?.lat}
                                                    receiverLng={userSettings?.lng}
                                                    receiverName={user?.name || 'Receiver'}
                                                    posts={filteredPosts}
                                                    fullScreen={true}
                                                    onSelectPost={(post) => handleSelectPost(post as any)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'all', label: 'All', icon: UtensilsCrossed },
                                { id: 'veg', label: 'Veg', icon: Leaf, color: 'text-green-600 bg-green-50 border-green-200' },
                                { id: 'non-veg', label: 'Non-Veg', icon: UtensilsCrossed, color: 'text-red-600 bg-red-50 border-red-200' },
                                { id: 'vegan', label: 'Vegan', icon: Leaf, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                                { id: 'mixed', label: 'Mixed', icon: Building2, color: 'text-orange-600 bg-orange-50 border-orange-200' }
                            ].map((item: any) => (
                                <Button
                                    key={item.id}
                                    variant={filter === item.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter(item.id as any)}
                                    className={`rounded-full px-4 h-9 font-bold transition-all ${filter === item.id
                                        ? 'bg-green-600 hover:bg-green-700 shadow-md scale-105 border-transparent text-white'
                                        : 'hover:border-green-300'
                                        }`}
                                >
                                    <item.icon className={`w-3.5 h-3.5 mr-2 ${filter === item.id ? 'text-white' : (item.color?.split(' ')[0] || 'text-muted-foreground')}`} />
                                    {item.label}
                                </Button>
                            ))}
                        </div>

                        <FoodList
                            posts={filteredPosts}
                            onSelectPost={handleSelectPost}
                            onContinuePayment={handleContinuePayment}
                            onOpenChat={handleOpenChat}
                            onRemovePost={(id) => setRemovedPostIds(prev => new Set([...prev, id]))}
                            filter={filter}
                            searchQuery={searchQuery}
                            onClearFilters={() => {
                                setSearchQuery('');
                                setFilter('all');
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="history" className="space-y-6">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold mb-6">Your Pickup History</h2>
                            <div className="grid gap-4">
                                {pickupHistory.map((item) => (
                                    <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                                    <UtensilsCrossed className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold">{item.foodType}</h3>
                                                    <p className="text-sm text-muted-foreground">{item.providerName}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {item.pickupDate.toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                                            <Leaf className="w-3 h-3" />
                                                            {item.impact} meals saved
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
                                                View Details
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                                <Button variant="outline" className="w-full" onClick={() => navigate('/history')}>
                                    Full Impact Dashboard
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Pickup Dialog */}
            <PickupDialog
                selectedFood={selectedFood}
                existingOrder={existingOrder}
                isOpen={isPickupDialogOpen}
                setIsOpen={setIsPickupDialogOpen}
                onSuccess={fetchFoods}
            />

            {/* Chat Dialog */}
            {chatOrder && (
                <ChatDialog
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    orderId={chatOrder.id}
                    providerName={chatOrder.providerName || 'Provider'}
                    isProviderView={false}
                />
            )}
        </div>
    );
}
