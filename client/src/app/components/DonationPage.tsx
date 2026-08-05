import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../api/axios';
import {
    ArrowLeft, Heart, CreditCard, Smartphone, Landmark,
    ShieldCheck, IndianRupee, CheckCircle2, AlertCircle, Building2, X, Wallet
} from 'lucide-react';
import { ReceiverWallet, WalletTransaction } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';
type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

export function DonationPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    // Amount selection states
    const [amount, setAmount] = useState('100');
    const [customAmount, setCustomAmount] = useState('');
    const [message, setMessage] = useState('');

    // Payment Interface states
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');

    // UPI fields
    const [upiId, setUpiId] = useState('');

    // Card fields
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');

    // Net Banking fields
    const [selectedBank, setSelectedBank] = useState('');

    const [receiverWallet, setReceiverWallet] = useState<ReceiverWallet | null>(null);

    useEffect(() => {
        // Load user from localStorage (auth session only)
        const userStr = localStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
        // Load wallet from MongoDB
        api.get('/wallet').then(res => {
            setReceiverWallet({
                points: res.data.points || 0,
                balanceINR: res.data.balanceINR || 0,
                totalOrders: 0,
                totalPointsEarned: res.data.points || 0,
                transactions: []
            } as any);
        }).catch(() => { });
    }, []);

    const quickAmounts = ['100', '250', '500', '1000', '2000', '5000'];

    // Formatting helpers
    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted.substring(0, 19);
    };

    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        }
        return cleaned;
    };

    const handlePayment = async () => {
        if (!user) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        const finalAmount = amount === 'custom' ? customAmount : amount;
        if (!finalAmount || Number(finalAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setPaymentStatus('processing');

        // Validation based on user's code
        if (paymentMethod === 'upi' && !upiId) {
            setPaymentStatus('error');
            toast.error('Please enter a valid UPI ID');
            setTimeout(() => setPaymentStatus('idle'), 2000);
            return;
        }

        if (paymentMethod === 'card') {
            if (!cardNumber || !cardName || !cardExpiry || !cardCVV) {
                setPaymentStatus('error');
                toast.error('Please fill all card details');
                setTimeout(() => setPaymentStatus('idle'), 2000);
                return;
            }
        }

        if (paymentMethod === 'netbanking' && !selectedBank) {
            setPaymentStatus('error');
            toast.error('Please select your bank');
            setTimeout(() => setPaymentStatus('idle'), 2000);
            return;
        }

        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2500));

        // Deduct from wallet if used
        if (paymentMethod === 'wallet' && receiverWallet) {
            const pointsToDeduct = Number(finalAmount) * 50;
            try {
                await api.post('/wallet/award', { points: -pointsToDeduct });
                setReceiverWallet(prev => prev ? {
                    ...prev,
                    points: prev.points - pointsToDeduct,
                    balanceINR: parseFloat(((prev.points - pointsToDeduct) / 50).toFixed(2))
                } : prev);
            } catch (err) { console.error('Failed to deduct wallet points:', err); }
        }

        setPaymentStatus('success');
        toast.success('Thank you for your generous donation!');
    };

    const banks = [
        'State Bank of India',
        'HDFC Bank',
        'ICICI Bank',
        'Axis Bank',
        'Kotak Mahindra Bank',
        'karur vysya bank',
        'Punjab National Bank',
        'Bank of Baroda',
        'Canara Bank',
        'Union Bank of India',
    ];

    if (paymentStatus === 'success') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full text-center space-y-6"
                >
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-16 h-16 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black">Success!</h1>
                        <p className="text-muted-foreground">
                            Your donation of <span className="text-foreground font-bold italic">₹{amount === 'custom' ? customAmount : amount}</span> was received.
                            You just helped make the community better!
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/')}
                        className="w-full bg-green-600 hover:bg-green-700 h-14 rounded-xl font-bold text-white shadow-xl"
                    >
                        Back to Home
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-md border-b px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-600 rounded-lg">
                            <Heart className="w-4 h-4 text-white fill-white" />
                        </div>
                        <h1 className="text-lg font-black tracking-tight uppercase">Donation Portal</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full ring-1 ring-border">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    SECURE 256-BIT SSL
                </div>
            </header>

            <main className="container max-w-6xl mx-auto p-4 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Amount Selection */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="space-y-2 text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tighter">Choose Your Contribution</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Join our movement to eliminate food waste. Every bit helps us coordinate pickups and support local families.
                            </p>
                        </div>

                        <Card className="border-none shadow-xl shadow-green-600/5 bg-white dark:bg-zinc-900 border-t-4 border-t-green-600 overflow-hidden">
                            <CardContent className="pt-8 space-y-8">
                                <div className="grid grid-cols-3 gap-3">
                                    {quickAmounts.map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => {
                                                setAmount(amt);
                                                setCustomAmount('');
                                            }}
                                            className={`h-16 rounded-xl border-2 font-black transition-all flex items-center justify-center gap-1 ${amount === amt
                                                ? 'border-green-600 bg-green-600 text-white shadow-lg shadow-green-600/20 scale-[1.02]'
                                                : 'border-muted hover:border-green-600/30 text-muted-foreground'
                                                }`}
                                        >
                                            <span className="text-sm">₹</span>{amt}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setAmount('custom');
                                        }}
                                        className={`h-16 rounded-xl border-2 font-black transition-all flex items-center justify-center gap-1 ${amount === 'custom'
                                            ? 'border-green-600 bg-green-600 text-white shadow-lg shadow-green-600/20'
                                            : 'border-muted hover:border-green-600/30 text-muted-foreground'
                                            }`}
                                    >
                                        Other
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {amount === 'custom' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-xl group-focus-within:text-green-600">₹</div>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter amount"
                                                    value={customAmount}
                                                    onChange={(e) => setCustomAmount(e.target.value)}
                                                    className="h-16 pl-10 text-2xl font-black border-2 focus:border-green-600 rounded-xl"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personal Message</Label>
                                    <Textarea
                                        placeholder="Add a word of encouragement..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="min-h-[100px] resize-none border-2 focus:border-green-600 rounded-xl"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-4 p-5 bg-green-500/10 rounded-2xl border border-green-500/20">
                            <div className="w-12 h-12 bg-white dark:bg-zinc-800 shadow-md rounded-xl flex items-center justify-center shrink-0">
                                <IndianRupee className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-green-700 dark:text-green-400">Your Impact</p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-tight">Every ₹100 helps us rescue enough food to feed up to 5 families in need.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Billing Interface */}
                    <div className="lg:col-span-7">
                        <Card className="border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden rounded-3xl">
                            {/* Theme Styled Header */}
                            <Card className="bg-green-600 rounded-none border-none p-8 text-white relative overflow-hidden">
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight uppercase">Secure Checkout</h3>
                                        <p className="text-white/80 text-sm font-medium">Complete your contribution securely</p>
                                    </div>
                                    <div className="text-center md:text-right bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Total to Pay</p>
                                        <p className="text-4xl font-black">₹{amount === 'custom' ? (customAmount || '0') : amount}</p>
                                    </div>
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            </Card>

                            <CardContent className="p-0">
                                <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="w-full">
                                    <TabsList className="w-full grid grid-cols-3 h-16 bg-muted/50 rounded-none border-b border-muted">
                                        <TabsTrigger value="upi" className="h-full gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 transition-all border-none rounded-none">
                                            <Smartphone className="w-4 h-4" /> UPI
                                        </TabsTrigger>
                                        <TabsTrigger value="card" className="h-full gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 transition-all border-none rounded-none">
                                            <CreditCard className="w-4 h-4" /> Card
                                        </TabsTrigger>
                                        <TabsTrigger value="netbanking" className="h-full gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 transition-all border-none rounded-none">
                                            <Building2 className="w-4 h-4" /> Bank
                                        </TabsTrigger>
                                        {user?.role === 'receiver' && (
                                            <TabsTrigger value="wallet" className="h-full gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 transition-all border-none rounded-none text-green-600">
                                                <Wallet className="w-4 h-4" /> Wallet
                                            </TabsTrigger>
                                        )}
                                    </TabsList>

                                    <div className="p-8">
                                        <div className="space-y-6">
                                            {/* UPI Payment Content */}
                                            <TabsContent value="upi" className="m-0 space-y-6">
                                                <div className="grid grid-cols-4 gap-3">
                                                    {[
                                                        { name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/512px-Google_Pay_Logo_%282020%29.svg.png' },
                                                        { name: 'PhonePe', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png' },
                                                        { name: 'Paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png' },
                                                        { name: 'BHIM', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/BHIM_Logo.svg/512px-BHIM_Logo.svg.png' }
                                                    ].map((app) => (
                                                        <button
                                                            key={app.name}
                                                            type="button"
                                                            onClick={() => setUpiId('demo@upi')}
                                                            className="aspect-square rounded-2xl border-2 border-muted hover:border-green-600/50 flex flex-col items-center justify-center gap-2 group transition-all p-3 bg-white dark:bg-zinc-800"
                                                        >
                                                            <div className="w-full h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                                                                <img src={app.logo} alt={app.name} className="max-h-full max-w-full object-contain" />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-zinc-500">{app.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <span className="w-full border-t border-muted" />
                                                    </div>
                                                    <div className="relative flex justify-center text-xs font-black uppercase tracking-widest">
                                                        <span className="bg-white dark:bg-zinc-900 px-3 text-muted-foreground">Or Enter UPI ID</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">UPI ID / VPA</Label>
                                                    <Input
                                                        placeholder="username@upi"
                                                        value={upiId}
                                                        onChange={(e) => setUpiId(e.target.value)}
                                                        className="h-14 border-2 rounded-xl focus:border-green-600 font-bold"
                                                    />
                                                    <p className="text-[10px] text-muted-foreground italic">You will receive a notification on your UPI app to authorize the payment.</p>
                                                </div>
                                            </TabsContent>

                                            {/* Card Payment Content */}
                                            <TabsContent value="card" className="m-0 space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name on Card</Label>
                                                    <Input
                                                        placeholder="JOHN DOE"
                                                        value={cardName}
                                                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                                        className="h-12 border-2 rounded-xl focus:border-green-600 font-bold"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Card Number</Label>
                                                    <div className="relative">
                                                        <Input
                                                            placeholder="xxxx xxxx xxxx xxxx"
                                                            value={cardNumber}
                                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                            className="h-12 pl-12 border-2 rounded-xl focus:border-green-600 font-mono tracking-widest"
                                                            required
                                                        />
                                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expiry Date</Label>
                                                        <Input
                                                            placeholder="MM/YY"
                                                            value={cardExpiry}
                                                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                            className="h-12 border-2 rounded-xl focus:border-green-600 font-mono"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">CVV</Label>
                                                        <Input
                                                            type="password"
                                                            placeholder="***"
                                                            maxLength={3}
                                                            value={cardCVV}
                                                            onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                                            className="h-12 border-2 rounded-xl focus:border-green-600 font-mono"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 pt-2 grayscale opacity-60">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Visa_2021.svg/1200px-Visa_2021.svg.png" className="h-3" alt="Visa" />
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-5" alt="Mastercard" />
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/RuPay-Logo.svg/1200px-RuPay-Logo.svg.png" className="h-3" alt="RuPay" />
                                                </div>
                                            </TabsContent>

                                            {/* Net Banking Content */}
                                            <TabsContent value="netbanking" className="m-0 space-y-4">
                                                <div className="grid grid-cols-2 gap-3">
                                                    {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                                                        <button
                                                            key={bank}
                                                            type="button"
                                                            onClick={() => setSelectedBank(bank)}
                                                            className={`h-12 border-2 rounded-xl font-bold text-sm transition-all ${selectedBank === bank
                                                                ? 'border-green-600 bg-green-50 dark:bg-green-900/10 text-green-700'
                                                                : 'border-muted hover:border-green-600/30'
                                                                }`}
                                                        >
                                                            {bank}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="space-y-4 pt-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account Holder Name</Label>
                                                        <Input placeholder="Enter full name" className="h-12 border-2 rounded-xl focus:border-green-600" />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account Number</Label>
                                                            <Input placeholder="xxxx-xxxx-xxxx" className="h-12 border-2 rounded-xl focus:border-green-600 font-mono" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">IFSC Code</Label>
                                                            <Input placeholder="ABCD0123456" className="h-12 border-2 rounded-xl focus:border-green-600 font-mono uppercase" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Other Bank</Label>
                                                        <Select value={selectedBank} onValueChange={setSelectedBank}>
                                                            <SelectTrigger className="h-14 border-2 rounded-xl focus:ring-green-600 font-bold">
                                                                <SelectValue placeholder="karur vysya bank" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {banks.map((bank) => (
                                                                    <SelectItem key={bank} value={bank} className="font-bold">{bank}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <div className="h-px bg-muted w-full" />

                                            {/* Wallet Payment Content */}
                                            <TabsContent value="wallet" className="m-0 space-y-6">
                                                <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border-2 border-green-100 dark:border-green-900/20">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-green-600 rounded-lg">
                                                                <Wallet className="w-5 h-5 text-white" />
                                                            </div>
                                                            <span className="font-black text-green-900 dark:text-green-100">Point Balance</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black text-green-600">{receiverWallet?.points || 0}</p>
                                                            <p className="text-[10px] font-black uppercase text-green-700/60 tracking-widest">Points Available</p>
                                                        </div>
                                                    </div>
                                                    <div className="h-px bg-green-200 dark:bg-green-800 w-full mb-4" />
                                                    <div className="flex justify-between items-center text-sm font-bold text-green-800 dark:text-green-300">
                                                        <span>Rupee Equivalent:</span>
                                                        <span>₹{receiverWallet?.balanceINR.toFixed(2) || '0.00'}</span>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-muted/50 rounded-xl border border-muted text-xs text-muted-foreground leading-relaxed">
                                                    <p>Conversion: 50 points = ₹1.00. Using your reward points for donation is a great way to support the community without out-of-pocket expenses.</p>
                                                </div>
                                            </TabsContent>

                                            {/* Final Action Button */}
                                            <div className="space-y-4">
                                                {paymentStatus === 'error' && (
                                                    <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-center gap-3 text-red-600">
                                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                                        <p className="text-sm font-bold">Please check all required fields and try again.</p>
                                                    </div>
                                                )}

                                                <Button
                                                    onClick={handlePayment}
                                                    disabled={paymentStatus === 'processing'}
                                                    className="w-full h-16 bg-green-600 hover:bg-green-700 text-white text-xl font-black rounded-2xl shadow-xl shadow-green-500/20 active:scale-[0.98] transition-all relative overflow-hidden group border-none"
                                                >
                                                    {paymentStatus === 'processing' ? (
                                                        <span className="flex items-center gap-3">
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                                            SECURELY PROCESSING...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2 tracking-tight">
                                                            COMPLETE CONTRIBUTION • ₹{amount === 'custom' ? (customAmount || '0') : amount}
                                                        </span>
                                                    )}
                                                </Button>

                                                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> PCI DSS COMPLIANT
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                                        <Landmark className="w-3.5 h-3.5 text-orange-600" /> ISO 27001 SECURE
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
