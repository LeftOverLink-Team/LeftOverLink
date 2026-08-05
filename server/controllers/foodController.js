const Food = require("../models/Food");
const User = require("../models/User");

exports.createFood = async (req, res) => {
  try {
    const { title, description, quantity, expiry, location } = req.body;

    console.log("Creating food with:", {
      title,
      description,
      quantity,
      expiry,
      location,
      provider: req.user.id,
    });

    if (!title || !description || !quantity || !expiry || !location) {
      console.error("Missing required fields:", {
        title,
        description,
        quantity,
        expiry,
        location,
      });
      return res.status(400).json({
        message:
          "Missing required fields: title, description, quantity, expiry, location",
      });
    }

    const food = await Food.create({
      title,
      description,
      quantity,
      expiry,
      location,
      provider: req.user.id,
      status: "available",
    });

    console.log("Food created successfully:", food);
    res.status(201).json(food);
  } catch (err) {
    console.error("Error creating food:", err);
    res
      .status(500)
      .json({ message: "Error creating food", error: err.message });
  }
};

// Return all foods (public endpoint for easier testing)
exports.getFoods = async (req, res) => {
  try {
    const foods = await Food.find().populate("provider", "name email");
    console.log(`Fetching foods: found ${foods.length} items`);
    res.json(foods);
  } catch (err) {
    console.error("Error fetching foods:", err);
    res
      .status(500)
      .json({ message: "Error fetching foods", error: err.message });
  }
};

exports.claimFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    if (food.status !== "available") {
      return res.status(400).json({ message: "Not available" });
    }

    food.status = "claimed";
    food.claimedBy = req.user.id;
    await food.save();

    // Award provider 10 rupees
    await User.findByIdAndUpdate(food.provider, {
      $inc: { wallet: 10 },
    });

    console.log(`Food claimed: ${req.params.id} by ${req.user.id}`);
    res.json({ message: "Food claimed successfully", food });
  } catch (err) {
    console.error("Error claiming food:", err);
    res
      .status(500)
      .json({ message: "Error claiming food", error: err.message });
  }
};

// Delete a food (provider only)
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Not found" });
    if (String(food.provider) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await Food.findByIdAndDelete(req.params.id);
    console.log(`Food deleted: ${req.params.id}`);
    res.json({ message: "Food deleted" });
  } catch (err) {
    console.error("Error deleting food:", err);
    res
      .status(500)
      .json({ message: "Error deleting food", error: err.message });
  }
};

// Increment view counter
exports.incrementView = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    );
    if (!food) return res.status(404).json({ message: "Not found" });
    res.json(food);
  } catch (err) {
    console.error("Error incrementing view:", err);
    res
      .status(500)
      .json({ message: "Error incrementing view", error: err.message });
  }
};
