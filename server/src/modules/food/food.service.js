const Food = require("./food.model");
const Organisation = require("../../../models/Organisation");
const Notification = require("../../../models/Notification");
const User = require("../../../models/User");

const createFood = async ({
  title,
  description,
  quantity,
  expiry,
  location,
  providerId,
  imageUrl,
}) => {
  const normalizedLocation = location || {};
  const lat =
    typeof normalizedLocation.lat === "number" && !Number.isNaN(normalizedLocation.lat)
      ? normalizedLocation.lat
      : 0;
  const lng =
    typeof normalizedLocation.lng === "number" && !Number.isNaN(normalizedLocation.lng)
      ? normalizedLocation.lng
      : 0;

  const doc = await Food.create({
    title,
    description,
    quantity,
    expiry,
    imageUrl,
    location: {
      lat,
      lng,
      address: normalizedLocation.address || "Unknown Location",
    },
    provider: providerId,
  });

  // Distribute alerts to nearby organisations and receivers
  await distributeNotifications(doc);

  return doc;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const distributeNotifications = async (foodPost) => {
  try {
    // 1. Notify Organisations
    const organisations = await Organisation.find({ "notifications.receiveFoodAlerts": true });
    for (const org of organisations) {
      if (!org.geo.lat || !org.geo.lng) continue;

      const dist = calculateDistance(
        foodPost.location.lat,
        foodPost.location.lng,
        org.geo.lat,
        org.geo.lng
      );

      if (dist <= org.notifications.maxDistanceKm) {
        await Notification.create({
          recipient: org._id,
          recipientModel: "Organisation",
          type: "food_alert",
          title: "New Surplus Food Available",
          message: `A provider is ready to share "${foodPost.title}" nearby (${dist.toFixed(1)}km away).`,
          foodRef: foodPost._id,
          metadata: { distance: dist, orgName: org.orgName }
        });
        console.log(`[Notification] Created alert for organisation: ${org.orgName}`);
      }
    }

    // 2. Notify Receivers
    const receivers = await User.find({ role: "receiver", "settings.notificationsEnabled": true });
    for (const receiver of receivers) {
      if (!receiver.settings.lat || !receiver.settings.lng) continue;

      const dist = calculateDistance(
        foodPost.location.lat,
        foodPost.location.lng,
        receiver.settings.lat,
        receiver.settings.lng
      );

      if (dist <= (receiver.settings.maxDistance || 10)) {
        await Notification.create({
          recipient: receiver._id,
          recipientModel: "User",
          type: "nearby",
          title: "Food Alert Near You! 🥦",
          message: `Fresh "${foodPost.title}" just shared ${dist.toFixed(1)}km from your location.`,
          foodRef: foodPost._id,
          metadata: { distance: dist }
        });
        console.log(`[Notification] Created alert for receiver: ${receiver.name}`);
      }
    }
  } catch (err) {
    console.error("Failed to distribute notifications:", err);
  }
};

// For now this mirrors the earlier getFoods controller, with hooks for
// pagination and geo-based filtering in future iterations.
const listFood = async ({ status }) => {
  const query = {};
  if (status) {
    query.status = status;
  }

  const foods = await Food.find(query).populate("provider", "name");
  return foods;
};

const incrementViews = async (id) => {
  await Food.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
};

const claimFood = async ({ id, receiverId, requestedMeals = 1 }) => {
  const food = await Food.findById(id);

  if (!food) {
    const err = new Error("Food not found");
    err.status = 404;
    throw err;
  }

  if (food.status !== "available" || food.quantity < requestedMeals) {
    const err = new Error("Not enough meals available or already claimed fully");
    err.status = 400; // Leaving as 400 to match standard flow, frontend might be showing 403 erroneously due to UI flow
    throw err;
  }

  food.quantity -= requestedMeals;
  if (food.quantity <= 0) {
    food.status = "claimed";
  }
  // We can track last claimedBy or push to an array if we redefine the schema later,
  // but for now, just updating the existing field will work to mark it 'claimed' eventually.
  food.claimedBy = receiverId;
  await food.save();

  return food;
};

const deleteFood = async ({ id, providerId }) => {
  const food = await Food.findById(id);
  if (!food) {
    const err = new Error("Food not found");
    err.status = 404;
    throw err;
  }
  if (String(food.provider) !== String(providerId)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  await Food.findByIdAndDelete(id);
};

module.exports = {
  createFood,
  listFood,
  incrementViews,
  claimFood,
  deleteFood,
};
