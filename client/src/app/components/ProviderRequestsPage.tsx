import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { ShoppingBag, ArrowLeft, Clock, MapPin, Loader2, Info, Users, ClipboardList, CheckCircle2, XCircle, Navigation, MessageCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from './ui/dialog';

import { Input } from './ui/input';
import { toast } from 'sonner';
import { ChatDialog } from './ChatDialog';

export function ProviderRequestsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');



    // Order Details State
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [deliveryTimeInput, setDeliveryTimeInput] = useState('');

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeChatOrder, setActiveChatOrder] = useState<any>(null);

    useEffect(() => {
        if (!user || user.role !== 'provider') return;

        const loadOrders = async () => {
            try {
                const res = await api.get('/orders/provider');
                // Show pending and accepted orders for action
                const active = (res.data as any[]).filter((o: any) =>
                    o.requestStatus === 'pending' || o.requestStatus === 'accepted'
                );
                setOrders(active);
            } catch (err) {
                setError('Could not load requests. Please check your connection.');
                console.error('Failed to load orders', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, [user]);

    const handleUpdateDeliveryTime = async (orderId: string) => {
        if (!deliveryTimeInput.trim()) return;

        try {
            await api.put(`/orders/${orderId}/status`, { estimatedDeliveryTime: deliveryTimeInput });

            // Update local state instantly
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estimatedDeliveryTime: deliveryTimeInput } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, estimatedDeliveryTime: deliveryTimeInput });
            }

            toast.success('Delivery/Pickup time updated successfully', { position: 'top-right' });
            setDeliveryTimeInput('');
        } catch (err) {
            console.error('Failed to update delivery time', err);
        }
    };

    const handleStatusAction = async (orderId: string, action: 'accepted' | 'declined') => {
        try {
            await api.put(`/orders/${orderId}/status`, { requestStatus: action });

            if (action === 'declined') {
                setOrders(prev => prev.filter(o => o.id !== orderId));
            } else {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, requestStatus: action } : o));
            }

            if (selectedOrder?.id === orderId) setSelectedOrder(null);
            toast.success(`Request ${action} successfully`, { icon: action === 'accepted' ? '✅' : '❌' });
        } catch (err) {
            console.error('Failed to update request status', err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans selection:bg-green-500/30">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 mt-20 max-w-5xl flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/provider')}
                        className="rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                            <ClipboardList className="w-8 h-8 text-green-600" />
                            Incoming Requests
                        </h1>
                        <p className="text-muted-foreground mt-1">Review claimed food, verify receiver locations, and set estimated delivery times.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                        <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading incoming requests...</p>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-red-200 shadow-sm min-h-[400px]">
                        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                        <h2 className="text-xl font-bold mb-2">Could not load requests</h2>
                        <p className="text-muted-foreground max-w-sm mb-6">{error}</p>
                        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-border/50 shadow-sm min-h-[400px]">
                        <div className="w-24 h-24 mb-6 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <ClipboardList className="w-12 h-12 text-green-600 opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No pending requests</h2>
                        <p className="text-muted-foreground max-w-md mb-8">
                            When receivers claim your food donations, their pickup requests will appear here for review.
                        </p>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-green-600/20 hover:scale-105 transition-all"
                            onClick={() => navigate('/post-food')}
                        >
                            Post Food Donation
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {orders.map((order, idx) => (
                                <motion.div
                                    key={order.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />

                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Order Details Column */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-xl font-bold">{order.foodType || 'Food Donation'}</h3>
                                                        <Badge variant="outline" className={`${order.paymentStatus === 'completed' ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10' : 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-500/10'}`}>
                                                            {order.paymentStatus === 'completed' ? 'Paid' : 'Payment Pending'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground font-medium flex items-center gap-1.5 text-sm">
                                                        <MapPin className="w-4 h-4 text-green-600" />
                                                        Claimed by: {order.receiverName || 'Anonymous Receiver'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-dashed border-border/60">
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Expected Time</p>
                                                    <p className="font-semibold text-sm flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                                                        {order.expectedTime || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Meals Provided</p>
                                                    <p className="font-semibold text-sm">{order.numberOfMeals || 1}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Bill</p>
                                                    <p className="font-bold text-sm text-green-600">₹{order.totalPrice || 0}</p>
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Claimed</p>
                                                    <p className="font-medium text-sm">
                                                        {order.pickupTime ? formatDistanceToNow(new Date(order.pickupTime), { addSuffix: true }) : 'Recently'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Column */}
                                        <div className="flex flex-col gap-3 md:min-w-[200px] border-t md:border-t-0 md:border-l border-dashed border-border/60 pt-4 md:pt-0 md:pl-6 justify-center">
                                            {(!order.requestStatus || order.requestStatus === 'pending') ? (
                                                <>
                                                    <Button
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold gap-2 h-11 transition-all hover:-translate-y-1 shadow-md shadow-green-600/20 px-0"
                                                        onClick={(e) => { e.stopPropagation(); handleStatusAction(order.id, 'accepted'); }}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold gap-2 h-11 transition-all hover:-translate-y-1 px-0"
                                                        onClick={(e) => { e.stopPropagation(); handleStatusAction(order.id, 'declined'); }}
                                                    >
                                                        <XCircle className="w-4 h-4 shrink-0" />
                                                        Decline
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col gap-2 w-full">
                                                    <Badge
                                                        className={`justify-center h-11 text-sm font-bold rounded-xl w-full flex items-center gap-2 ${order.requestStatus === 'accepted' ? 'bg-green-100 text-green-700 border-green-200 pointer-events-none' : 'bg-red-100 text-red-700 border-red-200 pointer-events-none'}`}
                                                        variant="outline"
                                                    >
                                                        {order.requestStatus === 'accepted' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                                                        {order.requestStatus === 'accepted' ? 'Accepted' : 'Declined'}
                                                    </Badge>
                                                    {order.requestStatus === 'accepted' && (
                                                        <Button
                                                            variant="outline"
                                                            className="w-full text-green-700 border-green-200 hover:bg-green-50 rounded-xl font-bold gap-2 h-11 transition-all shadow-sm px-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveChatOrder(order);
                                                                setIsChatOpen(true);
                                                            }}
                                                        >
                                                            <MessageCircle className="w-4 h-4 shrink-0" />
                                                            Chat with Receiver
                                                        </Button>
                                                    )}
                                                </div>
                                            )}

                                            <Button
                                                variant="outline"
                                                className="flex-1 w-full rounded-xl font-bold h-11 gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm px-0"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Info className="w-4 h-4 shrink-0" />
                                                Order Details
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>



            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                    {selectedOrder && (
                        <>
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center">
                                <DialogHeader className="p-0">
                                    <DialogTitle className="text-2xl font-black text-white">{selectedOrder.foodType}</DialogTitle>
                                    <DialogDescription className="text-green-100/90 font-medium">
                                        Claimed by: {selectedOrder.receiverName || 'Anonymous Receiver'}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 flex justify-center gap-2">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-transparent px-3 py-1">
                                        {selectedOrder.numberOfMeals} Meals
                                    </Badge>
                                    <Badge className={`px-3 py-1 backdrop-blur-md border-transparent ${selectedOrder.paymentStatus === 'completed' ? 'bg-green-800/50 hover:bg-green-800/70 text-green-100' : 'bg-orange-500/50 hover:bg-orange-500/70 text-orange-100'}`}>
                                        {selectedOrder.paymentStatus === 'completed' ? 'Paid' : 'Payment Pending'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-6 space-y-6 bg-background">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-border/50">
                                        <span className="text-muted-foreground font-medium text-sm">Order ID</span>
                                        <span className="font-bold text-sm tracking-tight">{selectedOrder.id || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-border/50">
                                        <span className="text-muted-foreground font-medium text-sm">Claimed At</span>
                                        <span className="font-bold text-sm flex items-center gap-1.5">
                                            {selectedOrder.pickupTime ? new Date(selectedOrder.pickupTime).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-border/50">
                                        <span className="text-muted-foreground font-medium text-sm">Expected Pickup Time</span>
                                        <span className="font-bold text-sm flex items-center gap-1.5 text-orange-600">
                                            <Clock className="w-3.5 h-3.5" />
                                            {selectedOrder.expectedTime || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-border/50">
                                        <span className="text-muted-foreground font-medium text-sm">Payment Method</span>
                                        <span className="font-bold text-sm uppercase tracking-wide">
                                            {selectedOrder.paymentMethod || 'COD'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 pb-4 border-b border-border/50">
                                        <span className="text-muted-foreground font-medium">Total Amount</span>
                                        <span className="text-2xl font-black text-green-600 tracking-tighter">
                                            ₹{selectedOrder.totalPrice || 0}
                                        </span>
                                    </div>

                                    {/* Receiver Location Map */}
                                    <div className="pt-2 pb-4 border-b border-border/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                                <Navigation className="w-4 h-4 text-green-600" />
                                                Receiver Location
                                            </p>
                                            {selectedOrder.distance && (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-bold">
                                                    {selectedOrder.distance.toFixed(1)} km away
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="w-full h-40 rounded-xl overflow-hidden relative border border-border">
                                            <MapContainer
                                                center={[selectedOrder.receiverLocation?.lat || 17.385, selectedOrder.receiverLocation?.lng || 78.4867]}
                                                zoom={13}
                                                className="w-full h-full z-0 font-sans"
                                                zoomControl={false}
                                            >
                                                <TileLayer
                                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                                />
                                                <Marker
                                                    position={[selectedOrder.receiverLocation?.lat || 17.385, selectedOrder.receiverLocation?.lng || 78.4867]}
                                                    icon={L.divIcon({
                                                        className: "custom-receiver-marker",
                                                        html: `
                                                        <div class="relative flex flex-col items-center">
                                                            <div style="background-color: #ef4444;" class="w-8 h-8 rounded-full rounded-br-sm rotate-45 border-2 border-white shadow-xl z-10 flex items-center justify-center">
                                                                <div class="w-3 h-3 bg-white rounded-full"></div>
                                                            </div>
                                                        </div>
                                                        `,
                                                        iconSize: [32, 32],
                                                        iconAnchor: [16, 32],
                                                        popupAnchor: [0, -32]
                                                    })}
                                                >
                                                    <Popup className="font-sans font-bold text-sm">Receiver's Location</Popup>
                                                </Marker>
                                            </MapContainer>
                                        </div>
                                    </div>

                                    {/* Edit Delivery Time Section */}
                                    <div className="pt-2">
                                        <p className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-green-600" />
                                            {selectedOrder.estimatedDeliveryTime ? 'Update Delivery/Pickup Time' : 'Set Expected Delivery/Pickup Time'}
                                        </p>

                                        {selectedOrder.estimatedDeliveryTime && (
                                            <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-2 rounded-lg text-sm mb-3 border border-green-200 dark:border-green-800">
                                                <strong>Current Estimate:</strong> {selectedOrder.estimatedDeliveryTime}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="e.g. Today at 5:30 PM"
                                                value={deliveryTimeInput}
                                                onChange={(e) => setDeliveryTimeInput(e.target.value)}
                                                className="bg-muted border-border focus-visible:ring-green-600"
                                            />
                                            <Button
                                                onClick={() => handleUpdateDeliveryTime(selectedOrder.id)}
                                                className="bg-green-600 hover:bg-green-700 font-bold shrink-0"
                                                disabled={!deliveryTimeInput.trim()}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md rounded-xl h-12 font-bold"
                                        onClick={() => setSelectedOrder(null)}
                                    >
                                        Close Details
                                    </Button>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Global Chat Dialog Overlay */}
            {activeChatOrder && (
                <ChatDialog
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    orderId={activeChatOrder.id}
                    providerName={activeChatOrder.receiverName || 'Receiver'}
                    isProviderView={true}
                />
            )}
        </div>
    );
}
