import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Clock, Users, Leaf, Trash2, CheckCircle } from 'lucide-react';
import { getTimeLeft } from '../mockData';
import { FoodStatus } from '../types';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import api from '../api/axios';

export function MyListingsPage() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  interface Listing {
    id: string;
    foodType: string;
    isVeg: boolean;
    quantity: number;
    description: string;
    expiryTime: Date;
    status: FoodStatus;
    postedAt: Date;
    views: number;
    interestedCount: number;
    reservedBy?: string;
  }

  const [listings, setListings] = useState<Listing[]>([]);

  // Load provider's listings from backend
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const userRes = await api.get('/auth/me');
        const user = userRes.data;
        const res = await api.get('/food');
        const all = res.data || [];
        const my = all
          .filter((f: any) => {
            const providerId = f.provider?._id || f.provider;
            return String(providerId) === String(user._id || user.id);
          })
          .map((f: any) => ({
            id: f._id || f.id,
            foodType: f.title || f.foodType || 'Food',
            isVeg: f.isVeg ?? true,
            quantity: f.quantity || 0,
            description: f.description || '',
            expiryTime: new Date(f.expiry || f.expiryTime || f.postedAt),
            status: f.status || 'available',
            postedAt: new Date(f.postedAt || Date.now()),
            views: f.views || 0,
            interestedCount: f.interested || f.interestedCount || 0,
            reservedBy: f.reservedBy
          }));
        setListings(my);
      } catch (err) {
        console.error('Failed to load listings', err);
      }
    };
    fetchListings();
  }, []);

  const handleDelete = (postId: string) => {
    setSelectedPostId(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPostId) return;
    try {
      await api.delete(`/food/${selectedPostId}`);
    } catch (err) {
      // ignore — backend may not support delete yet
      console.warn('Delete API failed', err);
    }
    setListings(prev => prev.filter(l => l.id !== selectedPostId));
    toast.success('Listing removed successfully');
    setDeleteDialogOpen(false);
    setSelectedPostId(null);
  };

  const markAsCollected = async (postId: string) => {
    try {
      await api.put(`/food/collect/${postId}`);
    } catch (err) {
      console.warn('Collect API failed', err);
    }
    setListings(prev => prev.map(l => (l.id === postId ? { ...l, status: 'collected' as const } : l)));
    toast.success('Marked as collected! Thank you for saving food.');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 shadow-md">
        <div className="container mx-auto max-w-4xl flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-green-700"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">My Food Listings</h1>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 bg-card border">
              <div className="text-2xl font-bold mb-1">{listings.filter(l => l.status === 'available').length}</div>
              <div className="text-sm text-muted-foreground">Active Listings</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-card border">
              <div className="text-2xl font-bold mb-1">{listings.filter(l => l.status === 'reserved').length}</div>
              <div className="text-sm text-muted-foreground">Reserved</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-card border">
              <div className="text-2xl font-bold mb-1">{listings.reduce((sum, l) => sum + l.views, 0)}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </Card>
          </motion.div>
        </div>

        {/* Listings */}
        <div className="space-y-4">
          {listings.length === 0 ? (
            <Card className="p-8 text-center bg-card border">
              <p className="text-muted-foreground mb-4">You haven't posted any food yet</p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/post-food')}
              >
                Post Your First Food
              </Button>
            </Card>
          ) : (
            listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 bg-card border hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Left: Food Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold">{listing.foodType}</h3>
                            {listing.isVeg ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                <Leaf className="w-3 h-3 mr-1" />
                                Veg
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
                                Non-Veg
                              </Badge>
                            )}
                          </div>
                          {listing.description && (
                            <p className="text-sm text-muted-foreground">{listing.description}</p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <Badge
                          variant={
                            listing.status === 'available' ? 'default' :
                              listing.status === 'reserved' ? 'secondary' :
                                'outline'
                          }
                          className={
                            listing.status === 'available' ? 'bg-green-600' :
                              listing.status === 'reserved' ? 'bg-yellow-600' :
                                'bg-gray-400'
                          }
                        >
                          {listing.status.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-3 text-sm mt-3">
                        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400 font-bold rounded-full shadow-sm">
                          <Users className="w-3.5 h-3.5" />
                          Feeds {listing.quantity}+ People
                        </Badge>

                        {getTimeLeft(listing.expiryTime) === 'Expired' || new Date(listing.expiryTime) < new Date() ? (
                          <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1 font-bold rounded-full shadow-sm animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-400 font-semibold rounded-full shadow-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {getTimeLeft(listing.expiryTime)} left
                          </Badge>
                        )}

                        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400 font-bold rounded-full shadow-sm">
                          <span className="text-base leading-none">🔥</span>
                          {listing.views || 0} Views
                        </Badge>
                      </div>

                      {/* Reserved By */}
                      {listing.status === 'reserved' && listing.reservedBy && (
                        <div className="bg-yellow-500/10 p-3 rounded-lg text-sm border border-yellow-500/20">
                          <strong className="text-yellow-700 dark:text-yellow-500">Reserved by:</strong> {listing.reservedBy}
                          <div className="text-xs text-yellow-600 dark:text-yellow-600/80 mt-1">
                            Please wait for pickup confirmation
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex md:flex-col gap-2 md:w-40">
                      {listing.status === 'reserved' && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => markAsCollected(listing.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Collected
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDelete(listing.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Post More Button */}
        {listings.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/post-food')}
            >
              Post More Food
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}