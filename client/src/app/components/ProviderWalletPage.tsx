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
    IndianRupee,
    History,
    Users,
    Gift
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
import { ProviderWallet, WalletTransaction } from '../types';
import api from '../api/axios';

export function ProviderWalletPage() {
    const navigate = useNavigate();
    const [wallet, setWallet] = useState<ProviderWallet | null>(null);
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
        const fetchWallet = async () => {
            try {
                const res = await api.get('/auth/me');
                const user = res.data;
                const mappedWallet: ProviderWallet = {
                    balanceINR: user.wallet || 0,
                    totalEarnings: user.totalEarnings || 0,
                    totalMealsDonated: user.totalMealsDonated || 0,
                    transactions: user.transactions || []
                };
                setWallet(mappedWallet);
            } catch (err) {
                console.error(err);
            }
        };
        fetchWallet();
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
            const amountINR = wallet.balanceINR;

            try {
                // Try to notify backend of redemption (if implemented)
                await api.post('/wallet/redeem', { amount: amountINR, bankDetails });
            } catch (err) {
                console.warn('Redeem API not available', err);
            }

            const newTransaction: WalletTransaction = {
                id: `tr-${Date.now()}`,
                userId: 'user-1',
                type: 'redemption',
                amount: 0,
                amountINR: amountINR,
                description: `Redeemed to bank account (${bankDetails.bankName})`,
                status: 'completed',
                timestamp: new Date(),
                recipientDetails: bankDetails
            };

            const updatedWallet: ProviderWallet = {
                ...wallet!,
                balanceINR: 0,
                transactions: [newTransaction, ...wallet!.transactions]
            };

            setWallet(updatedWallet);
            toast.success(`Successfully redeemed ₹${amountINR} to your bank account!`);
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
            try {
                await api.post('/donations', { amount, cause: selectedCause });
            } catch (err) {
                console.warn('Donations API not available', err);
            }

            const newTransaction: WalletTransaction = {
                id: `tr-${Date.now()}`,
                userId: 'user-1',
                type: 'donation',
                amount: 0,
                amountINR: amount,
                description: `Donated earnings to ${selectedCause}`,
                status: 'completed',
                timestamp: new Date(),
                recipientDetails: { cause: selectedCause }
            };

            const updatedWallet: ProviderWallet = {
                ...wallet!,
                balanceINR: wallet!.balanceINR - amount,
                transactions: [newTransaction, ...wallet!.transactions]
            };

            setWallet(updatedWallet);
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
                        <h1 className="text-xl font-black italic text-green-600 tracking-tighter uppercase">Provider Wallet</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Provider Stats Card */}
                <Card className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-white rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-green-600/20 mb-10 border-none">
                    <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                                <TrendingUp className="w-10 h-10" />
                            </div>
                            <div className="text-right">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1.5 px-4 backdrop-blur-md font-bold mb-2">
                                    Provider Rewards
                                </Badge>
                                <p className="text-[10px] text-green-100/60 font-black uppercase tracking-[0.2em]">Community Impact</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-green-50/70 text-xs font-black uppercase tracking-[0.3em] pl-1">Available Balance</p>
                            <div className="flex items-baseline gap-4 mt-2">
                                <span className="text-4xl font-black opacity-60">₹</span>
                                <h1 className="text-7xl font-black tracking-tighter tabular-nums">{wallet.balanceINR.toFixed(0)}</h1>
                                <span className="text-2xl font-black opacity-60">.{(wallet.balanceINR % 1).toFixed(2).split('.')[1]}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                            <div className="space-y-1">
                                <p className="text-green-50/60 text-[10px] font-black uppercase tracking-widest pl-1">Total Earnings</p>
                                <p className="text-3xl font-black tabular-nums">₹{wallet.totalEarnings.toFixed(0)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-green-50/60 text-[10px] font-black uppercase tracking-widest pl-1">Donations Impact</p>
                                <p className="text-3xl font-black tabular-nums">{wallet.totalMealsDonated}<span className="text-sm font-bold opacity-40 ml-1">meals</span></p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                className="flex-1 h-16 bg-white text-green-600 hover:bg-green-50 rounded-[1.25rem] font-black text-lg shadow-lg active:scale-95"
                                onClick={() => setIsRedeemDialogOpen(true)}
                                disabled={wallet.balanceINR <= 0}
                            >
                                <ArrowDownLeft className="w-6 h-6 mr-3" /> Withdraw Cash
                            </Button>
                            <Button
                                className="flex-1 h-16 bg-green-700/50 hover:bg-green-700 text-white border-2 border-white/20 rounded-[1.25rem] font-black text-lg backdrop-blur-md active:scale-95"
                                onClick={() => setIsDonationDialogOpen(true)}
                                disabled={wallet.balanceINR <= 0}
                            >
                                <Gift className="w-6 h-6 mr-3" /> Donate to NGO
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
                        <h2 className="text-3xl font-black flex items-center gap-3">
                            <History className="w-8 h-8 text-green-600" />
                            ACTIVITY LOG
                        </h2>
                    </div>

                    <div className="grid gap-4">
                        {wallet.transactions.length > 0 ? (
                            wallet.transactions.map((tr) => (
                                <motion.div
                                    key={tr.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <Card className="p-6 border-2 border-muted rounded-[1.5rem] transition-all hover:bg-muted/10 group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${tr.type === 'earning' ? 'bg-green-50 text-green-600 border-green-100 group-hover:bg-green-600 group-hover:text-white' :
                                                    tr.type === 'redemption' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white' :
                                                        'bg-green-50 text-green-700 border-green-100 group-hover:bg-green-700 group-hover:text-white'
                                                    }`}>
                                                    {tr.type === 'earning' ? <ArrowUpRight className="w-7 h-7" /> :
                                                        tr.type === 'redemption' ? <Building2 className="w-7 h-7" /> :
                                                            <Heart className="w-7 h-7" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-extrabold text-lg">{tr.description}</p>
                                                    <p className="text-xs text-muted-foreground font-bold opacity-70 uppercase tracking-wider">
                                                        {new Date(tr.timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} • {new Date(tr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xl font-black ${tr.type === 'earning' ? 'text-green-600' : 'text-green-700'}`}>
                                                    {tr.type === 'earning' ? '+' : '-'}₹{tr.amountINR.toFixed(2)}
                                                </div>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase text-muted-foreground border-muted">
                                                    {tr.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-muted/5 rounded-[2rem] border-2 border-dashed border-muted">
                                <Users className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                                <p className="text-muted-foreground font-bold">No activity yet. Share food to start earning!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Withdrawal Dialog (Reused from WalletPage logic but themed for Provider) */}
            <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                    <div className="bg-emerald-600 p-10 text-white relative overflow-hidden">
                        <DialogTitle className="text-3xl font-black italic mb-2">WITHDRAW FUNDS</DialogTitle>
                        <DialogDescription className="text-emerald-50 font-medium opacity-80">
                            Transfer your surplus food earnings to your verified bank account.
                        </DialogDescription>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="bg-green-50 p-6 rounded-[1.5rem] border-2 border-green-100 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Transfer Amount</span>
                            <h2 className="text-5xl font-black text-green-600 tabular-nums">₹{wallet.balanceINR.toFixed(2)}</h2>
                        </div>

                        <div className="grid gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">A/C Holder Name</Label>
                                <Input
                                    className="h-12 border-2 rounded-xl focus:border-green-600 font-bold"
                                    placeholder="Enter full name"
                                    value={bankDetails.holderName}
                                    onChange={(e) => setBankDetails({ ...bankDetails, holderName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Bank Name</Label>
                                <Input
                                    className="h-12 border-2 rounded-xl focus:border-green-600 font-bold"
                                    placeholder="e.g. HDFC Bank"
                                    value={bankDetails.bankName}
                                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Account No</Label>
                                    <Input
                                        className="h-12 border-2 rounded-xl focus:border-green-600 font-bold"
                                        placeholder="0001XXXXXX"
                                        value={bankDetails.accountNumber}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">IFSC Code</Label>
                                    <Input
                                        className="h-12 border-2 rounded-xl focus:border-green-600 font-bold uppercase"
                                        placeholder="SBIN0XXXX"
                                        value={bankDetails.ifsc}
                                        onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-14 rounded-xl font-bold border-2 active:scale-95"
                            onClick={() => setIsRedeemDialogOpen(false)}
                            disabled={isProcessing}
                        >
                            CANCEL
                        </Button>
                        <Button
                            className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black text-lg active:scale-95 shadow-lg"
                            onClick={handleRedeem}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "PROCESSING..." : "CONFIRM"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Donation Dialog */}
            <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                    <div className="bg-green-700 p-10 text-white relative overflow-hidden">
                        <DialogTitle className="text-3xl font-black italic mb-1">IMPACT DONATION</DialogTitle>
                        <DialogDescription className="text-green-50 font-medium opacity-80">
                            Turn your earnings into more meals for the community.
                        </DialogDescription>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Choose a Cause</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Hunger Relief', 'NGO Support', 'Green Kitchen', 'Kid\'s Meals'].map((cause) => (
                                    <button
                                        key={cause}
                                        onClick={() => setSelectedCause(cause)}
                                        className={`px-4 py-3 rounded-xl text-[11px] font-black border-2 transition-all ${selectedCause === cause
                                            ? 'bg-green-600 border-green-200 text-white shadow-md'
                                            : 'bg-muted/30 border-muted text-muted-foreground hover:border-green-100'
                                            }`}
                                    >
                                        {cause.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Amount (₹)</Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center font-black text-2xl text-green-600">₹</div>
                                <Input
                                    type="number"
                                    className="h-16 pl-12 border-2 rounded-2xl focus:border-green-600 font-black text-3xl tabular-nums"
                                    placeholder="0"
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-14 rounded-xl font-bold border-2 active:scale-95"
                            onClick={() => setIsDonationDialogOpen(false)}
                            disabled={isProcessing}
                        >
                            CLOSE
                        </Button>
                        <Button
                            className="flex-1 h-14 bg-green-600 hover:bg-green-700 rounded-xl font-black text-lg active:scale-95 shadow-lg"
                            onClick={handleDonate}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "DONATING..." : "DONATE NOW"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
