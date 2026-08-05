const express = require("express");
const { authenticate, requireRole } = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const {
  createFoodHandler,
  listFoodHandler,
  incrementViewsHandler,
  claimFoodHandler,
  deleteFoodHandler,
} = require("./food.controller");

const router = express.Router();

// Public listing endpoint with geo + pagination
router.get("/", listFoodHandler);

// Authenticated provider endpoints
router.post("/", authenticate, requireRole("provider"), upload.single("image"), createFoodHandler);
router.delete("/:id", authenticate, requireRole("provider"), deleteFoodHandler);

// Metrics and claim flows
router.post("/:id/view", incrementViewsHandler);
router.put("/claim/:id", authenticate, requireRole("receiver"), claimFoodHandler);

module.exports = router;

