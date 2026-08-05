import { FoodPost, User, Pickup, Donation } from "./types";

// Calculate urgency based on time left
export function calculateUrgency(
  expiryTime: Date | string | undefined,
): "fresh" | "medium" | "urgent" {
  if (!expiryTime) return "fresh";

  let expiryDate =
    expiryTime instanceof Date ? expiryTime : new Date(expiryTime);

  if (isNaN(expiryDate.getTime())) return "fresh";

  const now = new Date();
  const hoursLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursLeft > 2) return "fresh";
  if (hoursLeft > 1) return "medium";
  return "urgent";
}

// Calculate time left string
export function getTimeLeft(expiryTime: Date | string | undefined): string {
  if (!expiryTime) return "Time unknown";

  let expiryDate =
    expiryTime instanceof Date ? expiryTime : new Date(expiryTime);

  if (isNaN(expiryDate.getTime())) return "Invalid date";

  const now = new Date();
  const msLeft = expiryDate.getTime() - now.getTime();

  if (msLeft < 0) return "Expired";

  const minutesLeft = Math.floor(msLeft / (1000 * 60));
  const hoursLeft = Math.floor(minutesLeft / 60);

  if (hoursLeft > 0) {
    return `${hoursLeft}h ${minutesLeft % 60}m left`;
  }
  return `${minutesLeft}m left`;
}

// Calculate distance between two points (simplified)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
