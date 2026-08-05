export type UserRole = "provider" | "receiver" | "ngo" | "admin";

export type FoodStatus = "available" | "reserved" | "collected" | "expired";

export type UrgencyLevel = "fresh" | "medium" | "urgent";

export type DietaryType = "veg" | "non-veg" | "vegan" | "mixed";

export type PaymentMethod =
  | "cod"
  | "upi"
  | "net-banking"
  | "debit-card"
  | "credit-card";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  rating?: number;
  foodSavedCount?: number;
  foodDonatedCount?: number;
  points?: number;
  level?: number;
  verified?: boolean;
  profileImage?: string;
  joinedAt?: Date;
}

export interface FoodPost {
  id: string;
  providerId: string;
  providerName: string;
  providerRating?: number;
  foodType: string;
  isVeg: boolean;
  dietaryType: DietaryType;
  quantity: number; // feeds X people
  description?: string;
  expiryTime: Date | number;
  location: {
    lat: number;
    lng: number;
    address: string;
    hideExact?: boolean;
  };
  distance?: number;
  status: FoodStatus;
  imageUrl?: string;
  postedAt: Date;
  reservedBy?: string;
  reservedAt?: Date;
  collectedBy?: string;
  collectedAt?: Date;
  urgency?: UrgencyLevel;
}

export interface Pickup {
  id: string;
  foodPostId: string;
  foodPost?: FoodPost;
  providerId: string;
  providerName: string;
  receiverId: string;
  receiverName: string;
  pickupTime: Date;
  confirmed: boolean;
  providerConfirmed?: boolean;
  receiverConfirmed?: boolean;
  rating?: number;
  feedback?: string;
  mealsImpact?: number;
  co2Impact?: number;
  numberOfMeals?: number;
  totalPrice?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: "nearby" | "expiring" | "pickup" | "system" | "achievement";
  title: string;
  message: string;
  read: boolean;
  actionable?: boolean;
  relatedId?: string;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  category: "meals" | "donations" | "streak" | "impact";
  earnedAt?: Date;
}

export interface UserStats {
  totalMealsSaved: number;
  totalMealsDonated: number;
  co2Prevented: number;
  waterSaved: number;
  currentStreak: number;
  longestStreak: number;
  points: number;
  level: number;
  achievements: Achievement[];
  rank?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  type: "direct" | "from_earnings";
  message?: string;
  createdAt: Date;
}

export interface PaymentRecord {
  id: string;
  receiverId: string;
  foodId: string;
  numberOfMeals: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "completed" | "failed";
  paymentDetails?: any; // Stores UPI ID, Card last 4, etc.
  timestamp: Date;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: "earning" | "redemption" | "donation";
  amount: number; // in points
  amountINR: number;
  description: string;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
  recipientDetails?: {
    cause?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
  };
}

export interface ReceiverWallet {
  points: number;
  balanceINR: number;
  totalOrders: number;
  totalPointsEarned: number;
  transactions: WalletTransaction[];
}

export interface ProviderWallet {
  balanceINR: number;
  totalEarnings: number;
  totalMealsDonated: number;
  transactions: WalletTransaction[];
}
export type OrganisationCategory =
  | "orphanage"
  | "old-age-home"
  | "special-school"
  | "children-home"
  | "blind-school"
  | "rehab-center";

export interface Organisation {
  _id: string; // From Mongoose
  id?: string;  // Client-side alias if needed
  orgName: string;
  category: OrganisationCategory;
  address: string;
  district: string;
  state: string;
  pincode: string;
  phone: string | null;
  geo: {
    lat: number | null;
    lng: number | null;
    mapLink: string;
  };
  notifications: {
    receiveFoodAlerts: boolean;
    preferredFoodTypes: string[];
    maxDistanceKm: number;
  };
  distance?: number; // Calculated field
}
