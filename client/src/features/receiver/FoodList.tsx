import { useState, useEffect } from 'react';
import api from '../../app/api/axios';
import { Badge } from '../../app/components/ui/badge';
import { Button } from '../../app/components/ui/button';
import { Card } from '../../app/components/ui/card';
import { Leaf, MapPin, Clock, Search, Trash2, UtensilsCrossed, Building2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodPost } from '../../app/types';

interface FoodListProps {
    posts: FoodPost[];
    onSelectPost: (post: FoodPost) => void;
    onContinuePayment: (order: any, post: FoodPost) => void;
    onOpenChat: (order: any) => void;
    onRemovePost: (id: string) => void;
    filter: string;
    searchQuery: string;
    onClearFilters: () => void;
}

export function FoodList({ posts, onSelectPost, onContinuePayment, onOpenChat, onRemovePost, filter, searchQuery, onClearFilters }: FoodListProps) {
    const getTimeLeft = (expiryTime: number | Date) => {
        const timeValue = typeof expiryTime === 'number' ? expiryTime : expiryTime.getTime();
        const now = Date.now();
        const diff = timeValue - now;
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const [pendingRequests, setPendingRequests] = useState<Record<string, any>>({});

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const res = await api.get('/orders/mine');
                const now = Date.now();
                const pending: Record<string, any> = {};
                (res.data as any[]).forEach((item: any) => {
                    if (item.requestStatus === 'pending') {
                        const expiry = item.requestExpiry ? new Date(item.requestExpiry).getTime() : 0;
                        if (expiry > now) pending[item.foodPostId] = item;
                    } else if (item.requestStatus === 'accepted' && item.paymentStatus === 'pending') {
                        pending[item.foodPostId] = item;
                    }
                });
                setPendingRequests(pending);
            } catch (e) {
                console.error('Failed to load orders:', e);
            }
        };
        loadOrders();
        // Poll every 60s — orders don't change second-to-second, 5s was causing 429 rate limit errors
        const interval = setInterval(loadOrders, 60000);
        return () => clearInterval(interval);
    }, []);

    const formatCountdown = (expiryMs: number) => {
        const diff = expiryMs - Date.now();
        if (diff <= 0) return '00:00';
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className="overflow-hidden hover:shadow-xl transition-all border-green-100 dark:border-green-900/30">
                                {post.imageUrl && (
                                    <div className="w-full h-40 overflow-hidden border-b border-muted">
                                        <img src={post.imageUrl} alt={post.foodType} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{post.foodType}</h3>
                                            <p className="text-sm text-muted-foreground">{post.providerName}</p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`gap-1 font-bold ${post.dietaryType === 'veg' ? 'text-green-600 border-green-200 bg-green-50/50' :
                                                post.dietaryType === 'non-veg' ? 'text-red-600 border-red-200 bg-red-50/50' :
                                                    post.dietaryType === 'vegan' ? 'text-emerald-600 border-emerald-200 bg-emerald-50/50' :
                                                        'text-orange-600 border-orange-200 bg-orange-50/50'
                                                }`}
                                        >
                                            {post.dietaryType === 'veg' && <Leaf className="w-3 h-3" />}
                                            {post.dietaryType === 'vegan' && <Leaf className="w-3 h-3" />}
                                            {post.dietaryType === 'non-veg' && <UtensilsCrossed className="w-3 h-3" />}
                                            {post.dietaryType === 'mixed' && <Building2 className="w-3 h-3" />}
                                            <span className="capitalize">{post.dietaryType}</span>
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            <span>{post.distance != null ? `${post.distance.toFixed(1)} km away` : post.location.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            <span className={post.urgency === 'urgent' && getTimeLeft(post.expiryTime) !== 'Expired' ? 'text-red-500 font-bold' : getTimeLeft(post.expiryTime) === 'Expired' ? 'text-amber-600 font-medium' : ''}>
                                                {getTimeLeft(post.expiryTime) === 'Expired' ? 'Food is expired' : `Expires in ${getTimeLeft(post.expiryTime)}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {pendingRequests[post.id]?.requestStatus === 'pending' ? (
                                            <Button
                                                disabled
                                                className="flex-1 bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 font-bold cursor-not-allowed opacity-100"
                                            >
                                                Requested [{formatCountdown(pendingRequests[post.id].requestExpiry)}]
                                            </Button>
                                        ) : pendingRequests[post.id]?.requestStatus === 'accepted' && pendingRequests[post.id]?.paymentStatus === 'pending' ? (
                                            <div className="flex gap-2 w-full">
                                                <Button
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none font-bold"
                                                    onClick={() => onContinuePayment(pendingRequests[post.id], post)}
                                                >
                                                    Continue Payment
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="px-3 border-green-200 text-green-700 hover:bg-green-50 shrink-0"
                                                    onClick={() => onOpenChat(pendingRequests[post.id])}
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                disabled={getTimeLeft(post.expiryTime) === 'Expired'}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                                onClick={() => onSelectPost(post)}
                                            >
                                                Request Pickup
                                            </Button>
                                        )}
                                        {getTimeLeft(post.expiryTime) === 'Expired' && !pendingRequests[post.id] && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950/30 shrink-0"
                                                onClick={() => onRemovePost(post.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-full py-20 text-center space-y-4"
                    >
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold">No food available here</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            We couldn't find any {filter !== 'all' ? filter : ''} food items matching your location or search. Try expanding your search radius or checking back later!
                        </p>
                        <Button
                            variant="outline"
                            onClick={onClearFilters}
                            className="mt-4 border-green-600 text-green-600 hover:bg-green-50"
                        >
                            Clear all filters
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
