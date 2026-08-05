import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { ArrowLeft, Clock, Users, Leaf, ChevronRight, Check, AlertCircle, Camera, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from '../hooks/useLocation';
import { motion, AnimatePresence } from 'motion/react';
import { FoodPost } from '../types';
import api from '../api/axios';
import { FoodMap } from '../features/map/FoodMap';
import { AddressAutocomplete, LocationResult } from './AddressAutocomplete';
import { useAuth } from '../context/AuthContext';

export function PostFoodPage() {
  const navigate = useNavigate();
  const { detectLocation, isDetecting } = useLocation();
  const { user } = useAuth();

  // 2 steps now: (1) Food Info, (2) Quantity, Expiry & Location
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (user && user.role !== 'provider') navigate('/receiver');
  }, [user, navigate]);

  // Form states
  const [foodCategory, setFoodCategory] = useState<'veg' | 'non-veg' | 'vegan' | 'mixed'>('veg');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState([10]);
  const [hoursUntilExpiry, setHoursUntilExpiry] = useState([2]);
  const [address, setAddress] = useState('');
  const [detectedLocation, setDetectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image too large. Please select a file under 5MB.');
        return;
      }

      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectLocation = async () => {
    const location = await detectLocation();
    if (location) {
      setDetectedLocation(location);
      setAddress(location.address);
    }
  };

  const getEarnings = (q: number) => {
    let rate = q <= 10 ? 1 : q <= 20 ? 5 : 10;
    return q * rate;
  };

  const getRatePerMeal = (q: number) => q <= 10 ? 1 : q <= 20 ? 5 : 10;

  const canGoToStep2 = description.trim().length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || description.trim().length < 2) {
      toast.error('Please describe the food (at least 2 characters)');
      return;
    }
    if (!address?.trim()) {
      toast.error('Please provide a pickup location');
      return;
    }
    if (!user) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    const fallbackLocation = detectedLocation
      ? { lat: detectedLocation.lat, lng: detectedLocation.lng, address }
      : { lat: 0, lng: 0, address };

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + hoursUntilExpiry[0]);

    const formData = new FormData();
    formData.append('title', description.trim().substring(0, 60) || 'Food Donation');
    formData.append('description', description.trim());
    formData.append('quantity', String(Number(quantity[0])));
    formData.append('expiry', expiryDate.toISOString());
    formData.append('location', JSON.stringify(fallbackLocation));
    if (selectedImageFile) {
      formData.append('image', selectedImageFile);
    } else if (image) {
      formData.append('imageUrl', image);
    }

    try {
      await api.post('/food', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Food posted successfully!', {
        description: `You earned ₹${getEarnings(quantity[0])} for this donation.`
      });

      try { localStorage.setItem('refreshProviderListings', String(Date.now())); } catch (_) { }
      setTimeout(() => navigate('/provider'), 1500);
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || 'Failed to post food. Please try again.';
      const validationErrors = err?.response?.data?.errors;
      const detailMessage = err?.response?.data?.details
        || (Array.isArray(validationErrors)
          ? validationErrors.map((item: any) => item?.message).filter(Boolean).join(', ')
          : undefined);

      toast.error(detailMessage ? `${serverMessage}: ${detailMessage}` : serverMessage);
    }
  };

  if (!user) return null;

  const categories = [
    { id: 'veg', label: 'Vegetarian', emoji: '🥦', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200' },
    { id: 'non-veg', label: 'Non-Veg', emoji: '🍗', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200' },
    { id: 'vegan', label: 'Vegan', emoji: '🌱', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200' },
    { id: 'mixed', label: 'Mixed', emoji: '🍱', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top bar */}
      <header className="bg-background border-b px-4 py-4 sticky top-0 z-10">
        <div className="container mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/provider')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Post Surplus Food</h1>
              <p className="text-xs text-muted-foreground">Step {step} of 2</p>
            </div>
          </div>
          {/* Progress dots */}
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-green-600' : 'w-2 bg-muted'}`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── STEP 1: Category + Description ── */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-1">What are you sharing?</h2>
                  <p className="text-muted-foreground">Pick a category and describe the food</p>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                    Food Type
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFoodCategory(cat.id as any)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 relative ${foodCategory === cat.id
                          ? `${cat.border} ${cat.bg} shadow-sm ring-1 ring-offset-1 ring-green-600/30`
                          : 'border-muted hover:border-muted-foreground/30 bg-card'
                          }`}
                      >
                        <span className="text-2xl">{cat.emoji}</span>
                        <span className={`font-bold text-sm ${foodCategory === cat.id ? cat.color : ''}`}>{cat.label}</span>
                        {foodCategory === cat.id && (
                          <Check className="w-4 h-4 text-green-600 absolute top-2.5 right-2.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. 20 packets of vegetable biryani, freshly cooked for a cancelled event. No nuts, no dairy."
                    className="min-h-[140px] text-base rounded-xl border-2 focus:border-green-600 resize-none"
                  />
                  <p className="text-xs text-muted-foreground pl-1">
                    Mention allergens (nuts, dairy, soy) to keep the community safe.
                  </p>
                  {description.trim().length > 0 && description.trim().length < 2 && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> At least 2 characters required
                    </p>
                  )}
                </div>

                {/* Photo Upload */}
                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Add Photo (Optional)
                  </Label>
                  <div className="flex flex-col gap-4">
                    {!image ? (
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-2xl hover:border-green-600/50 hover:bg-green-50/30 transition-all cursor-pointer group">
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-green-600 mb-2" />
                          <span className="text-xs font-bold text-muted-foreground group-hover:text-green-600">Upload Gallery</span>
                        </label>
                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-2xl hover:border-green-600/50 hover:bg-green-50/30 transition-all cursor-pointer group">
                          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                          <Camera className="w-8 h-8 text-muted-foreground group-hover:text-green-600 mb-2" />
                          <span className="text-xs font-bold text-muted-foreground group-hover:text-green-600">Take Photo</span>
                        </label>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-green-600/20 group">
                        <img src={image} alt="Food preview" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="p-2 bg-white text-green-600 rounded-full cursor-pointer hover:bg-green-50 transition-colors">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <Camera className="w-5 h-5" />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setImage(null);
                              setSelectedImageFile(null);
                            }}
                            className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="absolute top-2 right-2 bg-green-600 text-white p-1 rounded-full shadow-lg">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground italic">
                      Adding a clear photo helps receivers trust the quality of your food.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!canGoToStep2}
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-bold rounded-xl shadow-lg shadow-green-600/20 disabled:opacity-50"
                >
                  Next — Quantity & Location <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}

            {/* ── STEP 2: Quantity + Expiry + Location ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Details & Location</h2>
                  <p className="text-muted-foreground">How many people can it serve, how long is it fresh for, and where?</p>
                </div>

                {/* Quantity */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-base font-bold">
                      <Users className="w-5 h-5 text-green-600" /> Serves approx.
                    </Label>
                    <span className="text-3xl font-black text-green-600">{quantity[0]} ppl</span>
                  </div>
                  <Slider value={quantity} onValueChange={setQuantity} min={1} max={100} step={1} className="py-2" />

                  {/* Earnings card */}
                  <div className="bg-gradient-to-r from-green-600 to-green-700 p-5 rounded-2xl text-white flex items-center justify-between">
                    <div>
                      <p className="text-green-100/80 text-xs font-medium uppercase tracking-widest mb-1">Impact Reward</p>
                      <p className="text-3xl font-black">₹{getEarnings(quantity[0])}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-100/80 mb-1">₹{getRatePerMeal(quantity[0])}/meal</p>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                        {quantity[0] <= 10 ? 'Standard' : quantity[0] <= 50 ? 'Community Hero' : 'Impact Champion'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expiry */}
                <div className="space-y-4 pt-2 border-t border-dashed border-muted">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-base font-bold">
                      <Clock className="w-5 h-5 text-orange-600" /> Best before
                    </Label>
                    <span className="text-2xl font-bold text-orange-600">{hoursUntilExpiry[0]} hrs</span>
                  </div>
                  <Slider value={hoursUntilExpiry} onValueChange={setHoursUntilExpiry} min={0.5} max={12} step={0.5} className="py-2" />
                  <p className="text-xs text-muted-foreground italic">
                    Receivers must pick up within this window. Shorter expiry items are prioritised on the map.
                  </p>
                </div>

                {/* Location */}
                <div className="space-y-3 pt-2 border-t border-dashed border-muted">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Pickup Location *</Label>
                  <AddressAutocomplete
                    defaultValue={address}
                    onSelect={(loc: LocationResult) => {
                      setAddress(loc.display_name);
                      setDetectedLocation({ lat: loc.lat, lng: loc.lon, address: loc.display_name });
                    }}
                    placeholder="Search for a street, landmark, or area..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className={`w-full justify-center h-11 rounded-xl text-green-700 font-bold hover:bg-green-50 dark:hover:bg-green-950/30 ${isDetecting ? 'opacity-50' : ''}`}
                    onClick={handleDetectLocation}
                    disabled={isDetecting}
                  >
                    {isDetecting
                      ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-green-600 border-t-transparent animate-spin rounded-full" />Detecting...</span>
                      : <span className="flex items-center gap-2">📍 Use my current location</span>
                    }
                  </Button>

                  {detectedLocation && (
                    <>
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900/40 flex items-start gap-3">
                        <div className="p-1.5 bg-green-600 text-white rounded-lg shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location Set</p>
                          <p className="text-sm font-medium">{detectedLocation.address}</p>
                        </div>
                      </div>
                      <FoodMap
                        centerLat={detectedLocation.lat}
                        centerLng={detectedLocation.lng}
                        posts={[{
                          id: 'preview',
                          foodType: description.substring(0, 30) + (description.length > 30 ? '...' : '') || 'Your food',
                          providerName: 'Pickup point',
                          location: { lat: detectedLocation.lat, lng: detectedLocation.lng, address: detectedLocation.address },
                          distance: null,
                        }]}
                      />
                    </>
                  )}
                </div>

                {/* Summary */}
                <Card className="bg-muted/30 border-none rounded-2xl">
                  <CardContent className="p-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Category</p>
                      <p className="text-sm font-bold capitalize">{foodCategory}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Quantity</p>
                      <p className="text-sm font-bold">Feeds {quantity[0]} ppl</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Earnings</p>
                      <p className="text-sm font-bold text-green-600">₹{getEarnings(quantity[0])}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Expiry</p>
                      <p className="text-sm font-bold text-orange-600">{hoursUntilExpiry[0]} hours</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-14 flex-1 rounded-xl">
                    Back
                  </Button>
                  <Button type="submit" className="h-14 flex-[2] bg-green-600 hover:bg-green-700 text-lg font-bold rounded-xl shadow-lg shadow-green-600/20">
                    Post Food Now 🚀
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
