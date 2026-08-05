import { useState, useEffect } from 'react';
import { FoodPost } from '../types';
import { getTimeLeft } from '../mockData';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Clock, Users, Leaf } from 'lucide-react';
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

interface FoodCardProps {
  post: FoodPost & { distance: number };
  onPickup: (postId: string) => void;
}

export function FoodCard({ post, onPickup }: FoodCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(post.expiryTime));
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(post.expiryTime));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [post.expiryTime]);

  const handlePickupClick = () => {
    setShowConfirmDialog(true);
  };

  const confirmPickup = () => {
    onPickup(post.id);
    toast.success('Food reserved!', {
      description: 'Please pick up within the time limit. Provider has been notified.'
    });
    setShowConfirmDialog(false);
  };

  const getUrgencyColor = () => {
    if (post.urgency === 'urgent') return 'border-l-4 border-l-red-500';
    if (post.urgency === 'medium') return 'border-l-4 border-l-yellow-500';
    return 'border-l-4 border-l-green-500';
  };

  const shouldBlink = post.urgency === 'urgent';

  // Check if timer should be red (under 30 minutes)
  const getTimeInMinutes = () => {
    const now = new Date();
    const diff = post.expiryTime.getTime() - now.getTime();
    return Math.floor(diff / (1000 * 60));
  };

  const minutesLeft = getTimeInMinutes();
  const isUrgent = minutesLeft <= 30;

  return (
    <>
      <motion.div
        animate={post.urgency === 'urgent' ? {
          x: [0, -2, 2, -2, 2, 0],
        } : {}}
        transition={{
          repeat: Infinity,
          duration: 0.5,
          repeatDelay: 3,
        }}
      >
        <Card className={`p-4 hover:shadow-lg transition-shadow ${getUrgencyColor()}`}>
          <div className="space-y-3">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-gray-900">{post.foodType}</h3>
                  {post.isVeg ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Leaf className="w-3 h-3 mr-1" />
                      Veg
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Non-Veg
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{post.providerName}</p>
              </div>

              {/* Urgency Badge */}
              {post.urgency === 'urgent' && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Badge variant="destructive" className="bg-red-500">
                    URGENT
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="w-4 h-4" />
                <span>Feeds ~{post.quantity}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{post.distance.toFixed(1)} km away</span>
              </div>
            </div>

            {/* Time Left */}
            <div className={`flex items-center gap-2 text-sm ${
              post.urgency === 'urgent' ? 'text-red-600' : 
              post.urgency === 'medium' ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              <Clock className={`w-4 h-4 ${shouldBlink ? 'animate-pulse' : ''}`} />
              <motion.span
                animate={shouldBlink ? { opacity: [1, 0.5, 1] } : {}}
                transition={shouldBlink ? { repeat: Infinity, duration: 1.5 } : {}}
              >
                {timeLeft}
              </motion.span>
            </div>

            {/* Description */}
            {post.description && (
              <p className="text-sm text-gray-500">{post.description}</p>
            )}

            {/* Address */}
            <p className="text-xs text-gray-500">{post.location.address}</p>

            {/* Pickup Button */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handlePickupClick}
            >
              I Can Pick This Up
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Pickup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you can pick up this food? Once confirmed, the provider will be notified 
              and the food will be reserved for you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
            <strong>Pickup Details:</strong>
            <div className="mt-2">
              <div>{post.providerName}</div>
              <div className="text-xs">{post.location.address}</div>
              <div className="text-xs text-red-600 mt-1">⏳ Must collect within: {timeLeft}</div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPickup}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Pickup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}