import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
    Wallet,
    ArrowLeft,
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    Heart,
    Building2,
    CheckCircle2,
    CreditCard,
    Smartphone,
    LogOut,
    UtensilsCrossed,
    IndianRupee,
    History
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
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
import { ReceiverWallet, WalletTransaction } from '../types';
import api from '../api/axios';

export function WalletPage() {
    const navigate = useNavigate();
    const [wallet, setWallet] = useState<ReceiverWallet | null>(null);
    const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
    const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Redemption State
    const [bankDetails, setBankDetails] = useState({
        holderName: '',
        bankName: '',
        accountNumber: '',
        ifsc: ''
    });

    // Donation State
    const [donationAmount, setDonationAmount] = useState<string>('');
    const [selectedCause, setSelectedCause] = useState<string>('Hunger Relief');

    useEffect(() => {
        const fetchUserWallet = async () => {
            try {
                const res = await api.get('/wallet');
                // Map backend wallet to ReceiverWallet structure
                const mappedWallet = {
                    points: res.data.points || 0,
                    balanceINR: res.data.balanceINR || 0,
                    totalOrders: 0,
                    totalPointsEarned: res.data.points || 0,
                    transactions: []
                };
                setWallet(mappedWallet as any);
            } catch (err) {
                console.error('Failed to load wallet:', err);
                // Fallback minimal shape so UI doesn't crash
                setWallet({ points: 0, balanceINR: 0, totalOrders: 0, totalPointsEarned: 0, transactions: [] } as any);
            }
        };
        fetchUserWallet();
    }, []);

    const handleRedeem = async () => {
        if (!bankDetails.holderName || !bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifsc) {
            toast.error('Please fill all bank details');
            return;
        }

        if (wallet && wallet.balanceINR <= 0) {
            toast.error('Insufficient balance for redemption');
            return;
        }

        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (wallet) {
            const amountToRedeem = wallet.points;
            const amountINR = wallet.balanceINR;

            // Deduct on the server side (award negative points)
            await api.post('/wallet/award', { points: -amountToRedeem });

            // Reflect change locally
            setWallet({ ...wallet, points: 0, balanceINR: 0 });
            toast.success(`Successfully redeemed ₹${amountINR.toFixed(2)} to your bank account!`);
        }

        setIsProcessing(false);
        setIsRedeemDialogOpen(false);
    };

    const handleDonate = async () => {
        const amount = parseFloat(donationAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (wallet && amount > wallet.balanceINR) {
            toast.error('Insufficient balance for donation');
            return;
        }

        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (wallet) {
            const pointsToDonate = Math.round(amount * 50);

            // Deduct on the server side
            await api.post('/wallet/award', { points: -pointsToDonate });

            // Reflect change locally
            setWallet({
                ...wallet,
                points: wallet.points - pointsToDonate,
                balanceINR: parseFloat(((wallet.points - pointsToDonate) / 50).toFixed(2)),
            });
            toast.success(`Thank you! You donated ₹${amount} to ${selectedCause}.`);
        }

        setIsProcessing(false);
        setIsDonationDialogOpen(false);
        setDonationAmount('');
    };

    if (!wallet) return null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="bg-background border-b px-4 py-3 sticky top-0 z-10">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-xl font-black italic text-green-600">Receiver Wallet</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-lg">
                {/* Main Stats Card */}
                <Card className="bg-green-600 p-6 text-white rounded-[2rem] relative overflow-hidden shadow-2xl shadow-green-600/20 mb-10 border-none transition-transform hover:scale-[1.01]">
                    <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                                <Wallet className="w-10 h-10" />
                            </div>
                            <div className="text-right">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1.5 px-4 backdrop-blur-md font-bold mb-2">
                                    Receiver Rewards
                                </Badge>
                                <p className="text-[10px] text-green-100/60 font-black uppercase tracking-[0.2em]">Verified Account</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-green-50/70 text-xs font-black uppercase tracking-[0.3em] pl-1">Available Points</p>
                            <div className="flex items-baseline gap-4 mt-2">
                                <h1 className="text-7xl font-black tracking-tighter tabular-nums">{wallet.points}</h1>
                                <span className="text-3xl font-black opacity-60">PTS</span>
                            </div>
                            <div className="flex items-center gap-2 mt-4 inline-flex px-4 py-2 bg-black/10 rounded-full font-black text-green-50">
                                <IndianRupee className="w-4 h-4" />
                                <span className="text-lg">Equivalent: ₹{wallet.balanceINR.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                            <div className="space-y-1">
                                <p className="text-green-50/60 text-[10px] font-black uppercase tracking-widest pl-1">Earnings</p>
                                <p className="text-3xl font-black tabular-nums">{wallet.totalPointsEarned}<span className="text-sm font-bold opacity-40 ml-1">pts</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-green-50/60 text-[10px] font-black uppercase tracking-widest pl-1">Saved</p>
                                <p className="text-3xl font-black tabular-nums">{wallet.totalOrders}<span className="text-sm font-bold opacity-40 ml-1">meals</span></p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                className="flex-1 h-16 bg-white text-green-600 hover:bg-green-50 rounded-[1.25rem] font-black text-lg transition-all active:scale-95 shadow-lg shadow-black/10"
                                onClick={() => setIsRedeemDialogOpen(true)}
                                disabled={wallet.points === 0}
                            >
                                <ArrowDownLeft className="w-6 h-6 mr-3" /> Redeem to Bank
                            </Button>
                            <Button
                                className="flex-1 h-16 bg-green-700/50 hover:bg-green-700 text-white border-2 border-white/20 rounded-[1.25rem] font-black text-lg backdrop-blur-md transition-all active:scale-95"
                                onClick={() => setIsDonationDialogOpen(true)}
                                disabled={wallet.points === 0}
                            >
                                <Heart className="w-6 h-6 mr-3" /> Support Causes
                            </Button>
                        </div>
                    </div>

                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>
                </Card>

                {/* Transaction History */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b-4 border-muted pb-4">
                        <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                            TRANSACTIONS
                        </h2>
                        <Badge variant="outline" className="h-8 px-4 rounded-full font-black border-2 border-muted text-muted-foreground">
                            Last 30 Days
                        </Badge>
                    </div>

                    <div className="grid gap-4">
                        {wallet.transactions.length > 0 ? (
                            wallet.transactions.map((tr) => (
                                <motion.div
                                    key={tr.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <Card className="p-6 hover:shadow-2xl hover:shadow-green-500/5 border-2 border-muted rounded-[1.5rem] transition-all group active:scale-[0.98]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all shadow-sm border-4 ${tr.type === 'earning' ? 'bg-green-50 text-green-600 border-green-100 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-400' :
                                                    tr.type === 'redemption' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-400' :
                                                        'bg-green-50 text-green-700 border-green-100 group-hover:bg-green-700 group-hover:text-white group-hover:border-green-500'
                                                    }`}>
                                                    {tr.type === 'earning' ? <ArrowUpRight className="w-8 h-8" /> :
                                                        tr.type === 'redemption' ? <ArrowDownLeft className="w-8 h-8" /> :
                                                            <Heart className="w-8 h-8" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-xl leading-none">{tr.description}</p>
                                                    <p className="text-sm text-muted-foreground font-bold tracking-tight opacity-70 flex items-center gap-2">
                                                        <History className="w-3.5 h-3.5" />
                                                        {new Date(tr.timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(tr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <div className={`text-2xl font-black mb-1 flex items-center ${tr.type === 'earning' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {tr.type === 'earning' ? '+' : '-'}{tr.amount}
                                                    <span className="text-xs font-black uppercase ml-1 opacity-50">Pts</span>
                                                </div>
                                                <div className="px-3 py-1 bg-muted/30 rounded-lg text-xs font-black font-mono tracking-tighter text-muted-foreground">
                                                    ₹{tr.amountINR.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-32 bg-muted/10 rounded-[2.5rem] border-4 border-dashed border-muted/50">
                                <Wallet className="w-24 h-24 text-muted/30 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-muted-foreground/60">YOUR WALLET IS READY</h3>
                                <p className="text-muted-foreground font-bold max-w-xs mx-auto mt-3">Start completing pickups to earn reward points and redeem them for cash!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Redeem To Bank Dialog */}
            <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
                <DialogContent className="max-w-xs p-0 overflow-hidden rounded-[2.5rem] border-none">
                    <div className="bg-green-600 p-6 text-white relative overflow-hidden">
                        <DialogTitle className="text-2xl font-black italic mb-1 tracking-tighter">REDEEM EARNINGS</DialogTitle>
                        <DialogDescription className="text-green-50 font-bold opacity-80">
                            Transfer your reward balance directly to your bank account.
                        </DialogDescription>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="bg-green-50/50 p-6 rounded-[1.5rem] flex items-center justify-between border-4 border-green-50 shadow-inner">
                            <div>
                                <p className="text-green-800 text-[10px] font-black uppercase tracking-[0.2em] mb-1">CASH EQUIVALENT</p>
                                <h2 className="text-4xl font-black text-green-900 tabular-nums">₹{wallet.balanceINR.toFixed(2)}</h2>
                            </div>
                            <div className="text-right">
                                <div className="bg-green-600 text-white px-4 py-2 rounded-xl text-lg font-black shadow-lg shadow-green-600/20">
                                    {wallet.points} <span className="text-xs opacity-60">PTS</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">A/C Holder Name</Label>
                                <Input
                                    className="h-12 border-4 border-muted rounded-2xl focus:border-green-500 transition-all font-black text-lg bg-muted/10"
                                    placeholder="SARANYA M"
                                    value={bankDetails.holderName}
                                    onChange={(e) => setBankDetails({ ...bankDetails, holderName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Bank Name</Label>
                                <Input
                                    className="h-12 border-4 border-muted rounded-2xl focus:border-green-500 transition-all font-black text-lg bg-muted/10"
                                    placeholder="STATE BANK OF INDIA"
                                    value={bankDetails.bankName}
                                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Account No</Label>
                                    <Input
                                        className="h-12 border-4 border-muted rounded-2xl focus:border-green-500 transition-all font-black text-lg bg-muted/10"
                                        placeholder="000123456789"
                                        value={bankDetails.accountNumber}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">IFSC Code</Label>
                                    <Input
                                        className="h-12 border-4 border-muted rounded-2xl focus:border-green-500 transition-all font-black text-lg bg-muted/10 uppercase"
                                        placeholder="SBIN0001234"
                                        maxLength={11}
                                        value={bankDetails.ifsc}
                                        onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-5 pt-0 flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-16 rounded-2xl font-black border-4 active:scale-95"
                            onClick={() => setIsRedeemDialogOpen(false)}
                            disabled={isProcessing}
                        >
                            CLOSE
                        </Button>
                        <Button
                            className="flex-1 h-16 bg-green-600 hover:bg-green-700 rounded-2xl font-black text-lg shadow-xl shadow-green-600/30 active:scale-95"
                            onClick={handleRedeem}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin rounded-full"></div>
                                    PROCESSING...
                                </span>
                            ) : `TRANSFER ₹${wallet.balanceINR.toFixed(2)}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Donation Dialog */}
            <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
                <DialogContent className="max-w-sm p-0 overflow-hidden rounded-[2.5rem] border-none">
                    <div className="bg-green-700 p-10 text-white relative overflow-hidden">
                        <DialogTitle className="text-3xl font-black italic mb-1 tracking-tighter">DONATE POINTS</DialogTitle>
                        <DialogDescription className="text-green-100 font-bold opacity-80">
                            Give back to the community using your reward balance.
                        </DialogDescription>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">SELECT A CAUSE</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Hunger Relief', 'Emergency Aid', 'Green Future', 'NGO Support'].map((cause) => (
                                    <button
                                        key={cause}
                                        onClick={() => setSelectedCause(cause)}
                                        className={`px-5 py-4 rounded-xl text-xs font-black transition-all border-4 ${selectedCause === cause
                                            ? 'bg-green-600 border-green-200 text-white shadow-xl shadow-green-600/20'
                                            : 'bg-muted/30 border-muted text-foreground/70 hover:border-green-100'
                                            }`}
                                    >
                                        {cause.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">AMOUNT TO DONATE (INR)</Label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-black text-green-600 group-focus-within:bg-green-600 group-focus-within:text-white transition-all">₹</div>
                                <Input
                                    type="number"
                                    className="h-14 pl-16 pr-24 border-4 border-muted rounded-[1.5rem] focus:border-green-600 transition-all font-black text-3xl tabular-nums bg-muted/10"
                                    placeholder="0"
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(e.target.value)}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">Points</p>
                                    <p className="text-xl font-black text-green-600">{donationAmount ? parseFloat(donationAmount) * 50 : '0'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-16 rounded-2xl font-black border-4 active:scale-95"
                            onClick={() => setIsDonationDialogOpen(false)}
                            disabled={isProcessing}
                        >
                            CLOSE
                        </Button>
                        <Button
                            className="flex-1 h-16 bg-green-600 hover:bg-green-700 rounded-2xl font-black text-lg shadow-xl shadow-green-600/30 active:scale-95"
                            onClick={handleDonate}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin rounded-full"></div>
                                    SENDING...
                                </span>
                            ) : `DONATE TO ${selectedCause.toUpperCase()}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
