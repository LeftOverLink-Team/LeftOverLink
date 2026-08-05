import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../api/axios';
import { CheckCircle, Star, Award, Leaf } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function PickupConfirmationPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pickup, setPickup] = useState({
    id: '0',
    providerName: 'Sample Provider',
    foodType: 'Food Item',
    quantity: 0,
    address: 'Unknown Location',
  });

  useEffect(() => {
    api.get('/orders/mine').then(res => {
      const latest = res.data[0];
      if (latest) {
        setPickup({
          id: latest.id,
          providerName: latest.providerName,
          foodType: latest.foodType,
          quantity: latest.numberOfMeals || 0,
          address: latest.receiverLocation?.address || 'Location provided during pickup',
        });
      }
    }).catch(() => { });
  }, []);

  const handleConfirm = async () => {
    if (rating === 0) {
      toast.error('Please rate your experience');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    toast.success('Thank you! Pickup confirmed and rated.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center">Confirm Food Collection</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-20">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="flex justify-center py-6"
        >
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </motion.div>

        {/* Pickup Details */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4">Pickup Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider:</span>
              <span className="font-bold">{pickup.providerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Food Type:</span>
              <span className="font-bold">{pickup.foodType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-bold">Feeds ~{pickup.quantity} people</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-bold text-sm">{pickup.address}</span>
            </div>
          </div>
        </Card>


        {/* Rating Section */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-2">Rate Your Experience</h2>
          <p className="text-sm text-muted-foreground mb-4">
            How was your pickup experience with {pickup.providerName}?
          </p>

          <div className="flex justify-center gap-2 my-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 ${star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted'
                    }`}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-muted-foreground mb-4 font-medium"
            >
              {rating === 5 && '🌟 Excellent!'}
              {rating === 4 && '😊 Great!'}
              {rating === 3 && '👍 Good'}
              {rating === 2 && '😐 Fair'}
              {rating === 1 && '😞 Poor'}
            </motion.div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Additional Feedback (Optional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="resize-none"
            />
          </div>
        </Card>

        {/* Rewards Preview */}
        <Card className="p-6 bg-purple-500/10 border-purple-500/20">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Rewards Earned
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-card border rounded-lg p-3">
              <span className="text-sm font-medium">Points Earned</span>
              <Badge className="bg-purple-600 text-white border-0">+50 pts</Badge>
            </div>
            <div className="flex items-center justify-between bg-card border rounded-lg p-3">
              <span className="text-sm font-medium">Current Level</span>
              <Badge variant="outline" className="border-purple-600 text-purple-600 font-bold">
                Food Saver - Level 3
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center font-medium">
            100 more points to reach Level 4!
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleConfirm}
            disabled={rating === 0 || isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 h-12"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm & Submit Rating'}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Skip for Now
          </Button>
        </div>

        {/* Trust Badge */}
        <Card className="p-4 bg-blue-500/10 border-blue-500/20">
          <p className="text-sm text-center text-blue-600 font-medium">
            🛡️ Your rating helps build a trusted community and ensures quality food rescue
          </p>
        </Card>
      </div>
    </div>
  );
}
