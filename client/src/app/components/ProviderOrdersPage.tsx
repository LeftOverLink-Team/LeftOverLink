import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { ShoppingBag, ArrowLeft, Clock, MapPin, Loader2, MessageCircle, Info, Users, Trash2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ChatDialog } from './ChatDialog';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from './ui/dialog';

export function ProviderOrdersPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Chat States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeChatOrder, setActiveChatOrder] = useState<{ id: string, counterpartyName: string } | null>(null);

    // Order Details State
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [removeOrderId, setRemoveOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'provider') return;

        const loadOrders = async () => {
            try {
                const res = await api.get('/orders/provider');
                // Show only accepted orders on this "shared food" page
                const accepted = (res.data as any[]).filter((o: any) => o.requestStatus === 'accepted');
                setOrders(accepted);
            } catch (err) {
                setError('Could not load orders. Please check your connection.');
                console.error('Failed to load orders', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, [user]);

    const handleOpenChat = (orderId: string, receiverName: string) => {
        setActiveChatOrder({ id: orderId, counterpartyName: receiverName });
        setIsChatOpen(true);
    };

    const handleRemove = async (orderId: string) => {
        try {
            await api.delete(`/orders/${orderId}`);
            setOrders(prev => prev.filter(o => o.id !== orderId));
            toast.success('Order removed');
        } catch {
            toast.error('Failed to remove order');
        } finally {
            setRemoveOrderId(null);
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
                            <ShoppingBag className="w-8 h-8 text-green-600" />
                            My Shared Food
                        </h1>
                        <p className="text-muted-foreground mt-1">Track food you have successfully shared and communicate with receivers.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                        <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading your history...</p>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-red-200 shadow-sm min-h-[400px]">
                        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                        <h2 className="text-xl font-bold mb-2">Could not load orders</h2>
                        <p className="text-muted-foreground max-w-sm mb-6">{error}</p>
                        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-border/50 shadow-sm min-h-[400px]">
                        <div className="w-24 h-24 mb-6 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <Users className="w-12 h-12 text-green-600 opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No completed orders yet</h2>
                        <p className="text-muted-foreground max-w-md mb-8">
                            When receivers claim your food donations, their pickup history will appear here.
                        </p>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-green-600/20 hover:scale-105 transition-all"
                            onClick={() => navigate('/provider')}
                        >
                            Return to Dashboard
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

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-dashed border-border/60">
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Meals Provided</p>
                                                    <p className="font-semibold text-lg">{order.numberOfMeals || 1}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Bill</p>
                                                    <p className="font-bold text-lg text-green-600">₹{order.totalPrice || 0}</p>
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Claimed At</p>
                                                    <p className="font-medium text-sm flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {order.pickupTime ? formatDistanceToNow(new Date(order.pickupTime), { addSuffix: true }) : 'Recently'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Column */}
                                        <div className="flex flex-row md:flex-col gap-3 md:min-w-[200px] border-t md:border-t-0 md:border-l border-dashed border-border/60 pt-4 md:pt-0 md:pl-6 justify-center">
                                            <Button
                                                className="flex-1 w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-zinc-900 rounded-xl font-bold gap-2 h-12 shadow-lg shadow-black/10 transition-all hover:-translate-y-1"
                                                onClick={() => handleOpenChat(order.id, order.receiverName || 'Receiver')}
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                Chat with Receiver
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className="flex-1 w-full rounded-xl font-bold h-12 gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Info className="w-4 h-4" />
                                                Order Details
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className="flex-1 w-full rounded-xl font-bold h-12 gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-900/50"
                                                onClick={() => setRemoveOrderId(order.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {activeChatOrder && (
                <ChatDialog
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    orderId={activeChatOrder.id}
                    providerName={activeChatOrder.counterpartyName}
                    isProviderView={true}
                />
            )}

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
                                        <span className="text-muted-foreground font-medium text-sm">Pickup Time</span>
                                        <span className="font-bold text-sm flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-green-600" />
                                            {selectedOrder.pickupTime ? new Date(selectedOrder.pickupTime).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-border/50">
                                        <span className="text-muted-foreground font-medium text-sm">Payment Method</span>
                                        <span className="font-bold text-sm uppercase tracking-wide">
                                            {selectedOrder.paymentMethod || 'COD'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-muted-foreground font-medium">Total Amount</span>
                                        <span className="text-2xl font-black text-green-600 tracking-tighter">
                                            ₹{selectedOrder.totalPrice || 0}
                                        </span>
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

            {/* Remove Confirmation Dialog */}
            <Dialog open={!!removeOrderId} onOpenChange={(open) => !open && setRemoveOrderId(null)}>
                <DialogContent className="sm:max-w-sm rounded-2xl border-none shadow-2xl">
                    <DialogHeader className="text-center">
                        <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                            <Trash2 className="w-7 h-7 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl font-black">Remove Order?</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            This will permanently delete this order from your history. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-xl h-11 font-bold"
                            onClick={() => setRemoveOrderId(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 rounded-xl h-11 font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                            onClick={() => removeOrderId && handleRemove(removeOrderId)}
                        >
                            Yes, Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
