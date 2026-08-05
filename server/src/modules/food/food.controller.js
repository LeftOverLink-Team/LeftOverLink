const { z } = require("zod");
const {
  createFood,
  listFood,
  incrementViews,
  claimFood,
  deleteFood,
} = require("./food.service");

const parseLocationValue = (value) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return { address: value };
    }
  }
  return value || {};
};

const locationSchema = z
  .object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    address: z.string().optional(),
  })
  .refine((value) => {
    const hasAddress = typeof value.address === "string" && value.address.trim().length > 0;
    const hasCoordinates =
      typeof value.lat === "number" &&
      typeof value.lng === "number" &&
      !Number.isNaN(value.lat) &&
      !Number.isNaN(value.lng);

    return hasAddress || hasCoordinates;
  }, {
    message: "Location must include an address or valid coordinates",
  });

const createFoodSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  quantity: z.coerce.number().int().min(1),
  expiry: z.coerce.date(),
  location: z.preprocess(parseLocationValue, locationSchema.optional().default({})),
  imageUrl: z.string().optional(),
});

const listFoodQuerySchema = z.object({
  status: z.string().optional(),
});

const createFoodHandler = async (req, res, next) => {
  try {
    const parsed = createFoodSchema.parse(req.body);
    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : parsed.imageUrl || undefined;

    const doc = await createFood({
      ...parsed,
      providerId: req.user.id,
      imageUrl,
    });

    // Match existing API: return the created document directly
    return res.status(201).json(doc);
  } catch (err) {
    if (err.name === "ZodError") {
      const validationSummary = err.errors
        .map((item) => `${item.path.join(".")}: ${item.message}`)
        .join(" | ");
      console.error("Food creation validation failed", {
        body: req.body,
        errors: err.errors,
        summary: validationSummary,
      });
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors,
        details: validationSummary,
      });
    }
    console.error("Food creation failed", err);
    return next(err);
  }
};

const listFoodHandler = async (req, res, next) => {
  try {
    const parsed = listFoodQuerySchema.parse(req.query);

    const results = await listFood({
      status: parsed.status,
    });

    // Match existing API: return array of foods
    return res.json(results);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors,
      });
    }
    return next(err);
  }
};

const incrementViewsHandler = async (req, res, next) => {
  try {
    const updated = await incrementViews(req.params.id);
    return res.json(updated || { ok: true });
  } catch (err) {
    return next(err);
  }
};

const claimFoodHandler = async (req, res, next) => {
  try {
    const requestedMeals = req.body.requestedMeals ? parseInt(req.body.requestedMeals, 10) : 1;
    const food = await claimFood({
      id: req.params.id,
      receiverId: req.user.id,
      requestedMeals
    });
    // For compatibility, respond with a simple message
    return res.json({ message: "Food claimed successfully", food });
  } catch (err) {
    return next(err);
  }
};

const deleteFoodHandler = async (req, res, next) => {
  try {
    await deleteFood({ id: req.params.id, providerId: req.user.id });
    return res.json({ message: "Food deleted" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createFoodHandler,
  listFoodHandler,
  incrementViewsHandler,
  claimFoodHandler,
  deleteFoodHandler,
};


