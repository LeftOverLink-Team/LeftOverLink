import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../app/components/ui/button';
import { Badge } from '../../app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../app/components/ui/dialog';
import { Label } from '../../app/components/ui/label';
import { Input } from '../../app/components/ui/input';
import { UtensilsCrossed, Building2, MapPin, AlertCircle, ChevronLeft, Wallet, Banknote, Smartphone, Landmark, CreditCard, CheckCircle2, IndianRupee, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { FoodPost, PaymentMethod, PaymentRecord } from '../../app/types';
import api from '../../app/api/axios';

const paymentOptions = [
    { id: 'cod', label: 'Cash on Pickup', icon: Banknote },
    { id: 'upi', label: 'UPI Payment', icon: Smartphone },
    { id: 'net-banking', label: 'Net Banking', icon: Landmark },
    { id: 'debit-card', label: 'Debit Card', icon: CreditCard },
    { id: 'credit-card', label: 'Credit Card', icon: CreditCard },
];

export function PickupDialog({
    selectedFood,
    existingOrder,
    isOpen,
    setIsOpen,
    onSuccess
}: {
    selectedFood: FoodPost | null;
    existingOrder?: any;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSuccess: () => void;
}) {
    const navigate = useNavigate();
    const [pickupStep, setPickupStep] = useState<'details' | 'payment' | 'pending'>('details');
    const [requestedMeals, setRequestedMeals] = useState<string>('1');
    const [isSubmittingPickup, setIsSubmittingPickup] = useState(false);

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [paymentData, setPaymentData] = useState<any>({});
    const [expectedTime, setExpectedTime] = useState('');
    const [upiApp, setUpiApp] = useState<string | null>(null);

    // Watch for existing order
    useEffect(() => {
        if (isOpen && existingOrder) {
            if (existingOrder.requestStatus === 'accepted') {
                setPickupStep('payment');
                setRequestedMeals(existingOrder.numberOfMeals?.toString() || '1');
            } else if (existingOrder.requestStatus === 'pending') {
                setPickupStep('pending');
            }
        } else if (isOpen) {
            setPickupStep('details');
        }
    }, [isOpen, existingOrder]);

    const calculateBilling = (meals: number) => {
        let pricePerPlate = 1;
        if (meals > 10 && meals <= 20) pricePerPlate = 5;
        if (meals > 20) pricePerPlate = 10;
        return {
            pricePerPlate,
            totalAmount: meals * pricePerPlate
        };
    };

    const handleConfirmPickup = async () => {
        const meals = parseInt(requestedMeals);
        if (isNaN(meals) || meals <= 0) {
            toast.error('Please enter a valid number of meals');
            return;
        }

        if (selectedFood && meals > selectedFood.quantity) {
            toast.error(`Only ${selectedFood.quantity} meals available`);
            return;
        }

        setIsSubmittingPickup(true);

        try {
            const billing = calculateBilling(meals);
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            // Fetch receiver location settings from DB
            let receiverLocation = { lat: 17.3850, lng: 78.4867 };
            try {
                const settingsRes = await api.get('/auth/settings');
                if (settingsRes.data?.lat) receiverLocation = { lat: settingsRes.data.lat, lng: settingsRes.data.lng };
            } catch { /* use defaults */ }

            await api.post('/orders', {
                foodPostId: selectedFood?.id,
                providerId: selectedFood?.providerId,
                providerName: selectedFood?.providerName,
                receiverName: user.name,
                numberOfMeals: meals,
                totalPrice: billing.totalAmount,
                foodType: selectedFood?.foodType,
                distance: Number(selectedFood?.distance ?? 0),
                expectedTime: expectedTime,
                requestExpiry: Date.now() + 15 * 60 * 1000,
                receiverLocation,
            });

            toast.success('Pickup request sent to provider! Awaiting confirmation.');
            setIsOpen(false);
            onSuccess();
        } catch (err: any) {
            console.error('Failed to request pickup:', err);
            const backendMessage = err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || err?.message;
            toast.error(backendMessage || 'Failed to submit request.');
        } finally {
            setIsSubmittingPickup(false);
        }
    };

    const validatePayment = () => {
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return false;
        }
        if (paymentMethod === 'upi') {
            if (!paymentData.upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(paymentData.upiId)) {
                toast.error('Please enter a valid UPI ID (e.g. name@upi)');
                return false;
            }
        }
        if (paymentMethod === 'net-banking') {
            if (!paymentData.bankName || !paymentData.accountNumber || !paymentData.ifsc || !paymentData.holderName) {
                toast.error('Please fill all banking fields');
                return false;
            }
            if (paymentData.accountNumber.length < 9) {
                toast.error('Invalid account number');
                return false;
            }
            if (paymentData.ifsc.length !== 11) {
                toast.error('IFSC should be 11 characters');
                return false;
            }
        }
        if (paymentMethod === 'debit-card' || paymentMethod === 'credit-card') {
            if (!paymentData.cardNumber || paymentData.cardNumber.length !== 16) {
                toast.error('Card number must be 16 digits');
                return false;
            }
            if (!paymentData.holderName) {
                toast.error('Please enter card holder name');
                return false;
            }
            if (!paymentData.expiry || !/^\d{2}\/\d{2}$/.test(paymentData.expiry)) {
                toast.error('Expiry must be MM/YY');
                return false;
            }
            if (!paymentData.cvv || paymentData.cvv.length !== 3) {
                toast.error('CVV must be 3 digits');
                return false;
            }
        }
        return true;
    };

    const handleProcessPayment = async () => {
        if (!validatePayment()) return;
        if (!selectedFood) return;

        setIsSubmittingPickup(true);

        try {
            const meals = parseInt(requestedMeals);
            await api.put(`/food/claim/${selectedFood.id}`, { requestedMeals: meals });

            const billing = calculateBilling(meals);

            // Update order payment status in MongoDB
            if (existingOrder) {
                await api.put(`/orders/${existingOrder.id}/payment`, {
                    paymentMethod,
                    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
                });
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Award points in MongoDB
            await api.post('/wallet/award', { points: 50 });

            setIsSubmittingPickup(false);
            setIsOpen(false);
            onSuccess(); // Triggers fetchFoods in parent

            if (paymentMethod === 'cod') {
                toast.success(`Success! You will pay ₹${billing.totalAmount} at the time of pickup.`);
            } else {
                toast.success(`Payment Successful! Total: ₹${billing.totalAmount}`);
            }

            navigate('/pickup-confirmation');
        } catch (err) {
            console.error('Payment processing error:', err);
            setIsSubmittingPickup(false);
            toast.error('Failed to process payment. Please try again.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                setPickupStep('details');
                setPaymentMethod(null);
                setPaymentData({});
            }
        }}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none">
                {selectedFood && (
                    <div className="flex flex-col">
                        <div className="bg-green-600 p-6 text-white text-center sm:text-left relative overflow-hidden">
                            {pickupStep === 'payment' && !existingOrder && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 top-4 text-white hover:bg-white/10"
                                    onClick={() => setPickupStep('details')}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsOpen(false)}
                                className="absolute right-4 top-4 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-50 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 border border-red-500/20 group"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4 drop-shadow-sm group-hover:scale-110 transition-transform" />
                            </motion.button>
                            <DialogHeader className="p-0 text-white">
                                <DialogTitle className="text-xl font-black">
                                    {pickupStep === 'details' ? 'Confirm Pickup' : pickupStep === 'pending' ? 'Request Status' : 'Payment Interface'}
                                </DialogTitle>
                                <DialogDescription className="text-green-100 text-xs">
                                    {pickupStep === 'details' ? 'Review details and complete your request' : pickupStep === 'pending' ? 'Check your request progress' : 'Select a payment method and complete the transaction'}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-6 flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                                    {pickupStep === 'details' ? <UtensilsCrossed className="w-6 h-6 text-white" /> : pickupStep === 'pending' ? <Clock className="w-6 h-6 text-white" /> : <Wallet className="w-6 h-6 text-white" />}
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-lg leading-tight">
                                        {pickupStep === 'details' ? selectedFood.foodType : pickupStep === 'pending' ? 'Pending Approval' : `Total: ₹${calculateBilling(parseInt(requestedMeals)).totalAmount}`}
                                    </h4>
                                    <p className="text-sm text-green-100 flex items-center gap-1 mt-1">
                                        <Building2 className="w-3 h-3" /> {selectedFood.providerName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6 bg-background max-h-[70vh] overflow-y-auto">
                            <AnimatePresence mode="wait">
                                {pickupStep === 'details' ? (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available Status</Label>
                                                    <div className="flex items-center gap-2 text-sm font-bold">
                                                        <Badge variant="outline" className="text-green-600 border-green-200">
                                                            {selectedFood.quantity} Meals Left
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</Label>
                                                    <p className="text-sm font-bold flex items-center gap-1 truncate">
                                                        <MapPin className="w-3 h-3 text-green-600" />
                                                        {selectedFood.location.address}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                                                <div className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border italic">
                                                    "{selectedFood.description || 'No description provided'}"
                                                </div>
                                            </div>

                                            <div className="h-px bg-muted w-full" />

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold uppercase tracking-widest">How many meals?</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max={selectedFood.quantity}
                                                            value={requestedMeals}
                                                            onChange={(e) => setRequestedMeals(e.target.value)}
                                                            className="w-20 h-10 text-center font-bold border-2 focus:border-green-600 rounded-lg"
                                                        />
                                                        <span className="text-xs font-medium text-muted-foreground">/ {selectedFood.quantity}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest">Expected Pickup Time</Label>
                                                    <Input
                                                        placeholder="e.g. In 30 mins, 5:00 PM"
                                                        value={expectedTime}
                                                        onChange={(e) => setExpectedTime(e.target.value)}
                                                        className="w-full h-11 border-2 focus:border-green-600 rounded-lg"
                                                    />
                                                </div>

                                                <div className="bg-slate-50 dark:bg-zinc-900 border rounded-xl p-4 space-y-3">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground">Price per plate</span>
                                                        <span className="font-bold flex items-center text-green-600">
                                                            <IndianRupee className="w-3 h-3" />
                                                            {calculateBilling(parseInt(requestedMeals) || 0).pricePerPlate}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-lg">
                                                        <span className="font-black uppercase tracking-tighter text-sm">Total Amount</span>
                                                        <span className="font-black text-green-600 flex items-center text-2xl">
                                                            <IndianRupee className="w-4 h-4" />
                                                            {calculateBilling(parseInt(requestedMeals) || 0).totalAmount}
                                                        </span>
                                                    </div>
                                                    <div className="pt-2 border-t border-dashed">
                                                        <div className="flex items-start gap-2 text-[10px] text-muted-foreground leading-tight">
                                                            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                                            <span>Tier: 1-10 (₹1), 11-20 (₹5), 21-50 (₹10). Proceeds help maintain hygiene and delivery logistics.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-12 rounded-xl font-bold"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                className="flex-1 h-12 rounded-xl font-black bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                                                onClick={handleConfirmPickup}
                                                disabled={isSubmittingPickup || parseInt(requestedMeals) > selectedFood.quantity || parseInt(requestedMeals) <= 0 || !expectedTime.trim()}
                                            >
                                                {isSubmittingPickup ? 'Requesting...' : 'Request Pickup'}
                                            </Button>
                                        </DialogFooter>
                                    </motion.div>
                                ) : pickupStep === 'pending' ? (
                                    <motion.div
                                        key="pending"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6 flex flex-col items-center justify-center py-8"
                                    >
                                        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shadow-inner">
                                            <Clock className="w-10 h-10 animate-pulse" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-xl font-bold">Awaiting Provider Approval</h3>
                                            <p className="text-sm text-muted-foreground w-64 mx-auto leading-relaxed">
                                                Your pickup request has been sent. Once the provider accepts, you'll be able to proceed with payment.
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 rounded-xl font-bold mt-4 border-2"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Close
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="payment"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Payment Method</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {paymentOptions.map((method) => {
                                                    const Icon = method.icon;
                                                    return (
                                                        <button
                                                            key={method.id}
                                                            onClick={() => setPaymentMethod(method.id as any)}
                                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${paymentMethod === method.id
                                                                ? 'border-green-600 bg-green-50/50'
                                                                : 'hover:border-green-200 bg-muted/20'
                                                                }`}
                                                        >
                                                            <Icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-green-600' : 'text-muted-foreground'}`} />
                                                            <span className={`text-[10px] font-black uppercase text-center ${paymentMethod === method.id ? 'text-green-900' : 'text-muted-foreground'}`}>
                                                                {method.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <AnimatePresence mode="wait">
                                                {paymentMethod === 'cod' && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 p-4 rounded-xl border border-green-200 text-green-800 text-sm flex gap-3">
                                                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                                                        <p><strong>Confirm:</strong> You will pay the amount at the time of pickup to the provider.</p>
                                                    </motion.div>
                                                )}

                                                {paymentMethod === 'upi' && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                                        <div className="flex gap-2 p-1 bg-muted rounded-lg overflow-x-auto">
                                                            {['gpay', 'phonepe', 'paytm', 'bhim'].map(app => (
                                                                <button
                                                                    key={app}
                                                                    onClick={() => setUpiApp(app)}
                                                                    className={`flex-1 min-w-[70px] py-2 text-[9px] font-black uppercase rounded-md transition-all ${upiApp === app ? 'bg-white shadow-sm ring-1 ring-black/5' : 'text-muted-foreground'}`}
                                                                >
                                                                    {app}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <Input
                                                            placeholder="Enter UPI ID (e.g. name@upi)"
                                                            value={paymentData.upiId || ''}
                                                            onChange={(e) => setPaymentData({ ...paymentData, upiId: e.target.value })}
                                                            className="h-12 border-2 focus:border-green-600 rounded-xl font-medium"
                                                        />
                                                    </motion.div>
                                                )}

                                                {paymentMethod === 'net-banking' && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
                                                        <Input
                                                            placeholder="Bank Name"
                                                            className="col-span-2 h-11 border-2 focus:border-green-600 rounded-xl"
                                                            value={paymentData.bankName || ''}
                                                            onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="Account Holder Name"
                                                            className="col-span-2 h-11 border-2 focus:border-green-600 rounded-xl"
                                                            value={paymentData.holderName || ''}
                                                            onChange={(e) => setPaymentData({ ...paymentData, holderName: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="Account Number"
                                                            className="h-11 border-2 focus:border-green-600 rounded-xl"
                                                            value={paymentData.accountNumber || ''}
                                                            onChange={(e) => setPaymentData({ ...paymentData, accountNumber: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="IFSC Code"
                                                            className="h-11 border-2 focus:border-green-600 rounded-xl uppercase"
                                                            maxLength={11}
                                                            value={paymentData.ifsc || ''}
                                                            onChange={(e) => setPaymentData({ ...paymentData, ifsc: e.target.value })}
                                                        />
                                                    </motion.div>
                                                )}

                                                {(paymentMethod === 'debit-card' || paymentMethod === 'credit-card') && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-3">
                                                        <Input
                                                            placeholder="Card Number (16 digits)"
                                                            className="col-span-4 h-11 border-2 focus:border-green-600 rounded-xl"
                                                            maxLength={16}
                                                            value={paymentData.cardNumber || ''}
                                                            onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="Card Holder Name"
                                                            className="col-span-4 h-11 border-2 focus:border-green-600 rounded-xl"
                                                            value={paymentData.holderName || ''}
                                                            onChange={(e) => setPaymentData({ ...paymentData, holderName: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="MM/YY"
                                                            className="col-span-2 h-11 border-2 focus:border-green-600 rounded-xl"
                                                            maxLength={5}
                                                            value={paymentData.expiry || ''}
                                                            onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="CVV"
                                                            className="col-span-2 h-11 border-2 focus:border-green-600 rounded-xl"
                                                            maxLength={3}
                                                            type="password"
                                                            value={paymentData.cvv || ''}
                                                            onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
                                            <Button
                                                className="flex-1 h-14 rounded-xl font-black bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                                                disabled={isSubmittingPickup || !paymentMethod}
                                                onClick={handleProcessPayment}
                                            >
                                                {isSubmittingPickup ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    paymentMethod === 'cod' ? 'Confirm Pickup' : 'Proceed to Pay'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
