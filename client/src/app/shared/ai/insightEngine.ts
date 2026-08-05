import type { FoodPost } from "../../types";

type Insight = {
  title: string;
  description: string;
  severity: "info" | "success" | "warning";
};

export function getReceiverInsights(foods: FoodPost[]): Insight[] {
  if (!foods.length) {
    return [
      {
        title: "AI Insight: Quiet Nearby",
        description: "There are no active surplus posts near you right now. Try expanding your radius or checking back in an hour.",
        severity: "info",
      },
    ];
  }

  const expiringSoon = foods.filter((f) => f.expiryTime && f.expiryTime.getTime() - Date.now() < 60 * 60 * 1000);

  if (expiringSoon.length > 0) {
    return [
      {
        title: "AI Insight: Time‑Sensitive Meals",
        description: `${expiringSoon.length} posts will expire in under an hour. Prioritize these to maximize rescued meals.`,
        severity: "warning",
      },
    ];
  }

  return [
    {
      title: "AI Insight: Healthy Supply Nearby",
      description: "Multiple fresh posts are available near you. Filter by dietary type to find the best match.",
      severity: "success",
    },
  ];
}

export function getProviderInsights(totalListings: number): Insight[] {
  if (!totalListings) {
    return [
      {
        title: "AI Insight: First Listing Opportunity",
        description: "Providers who post at least once per day see 3× higher pickup rates. Try posting today’s surplus.",
        severity: "info",
      },
    ];
  }

  return [
    {
      title: "AI Insight: Consistent Impact",
      description: "Your consistent posting pattern increases pickup reliability. Consider adding expiry details to improve match quality.",
      severity: "success",
    },
  ];
}

