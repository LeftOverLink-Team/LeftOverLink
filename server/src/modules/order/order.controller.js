const { z } = require("zod");
const orderService = require("./order.service");

const createOrderSchema = z.object({
  foodPostId: z.string().min(1),
  providerId: z.string().min(1),
  providerName: z.string().default(""),
  receiverName: z.string().default(""),
  numberOfMeals: z.number().int().positive(),
  totalPrice: z.number().min(0),
  foodType: z.string().default("Food"),
  distance: z.preprocess(
    (value) => (value === null || value === undefined ? 0 : value),
    z.number().min(0).optional().default(0)
  ),
  expectedTime: z.string().optional().default(""),
  requestExpiry: z.number().optional(),
  receiverLocation: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

const updateStatusSchema = z.object({
  requestStatus: z.enum(["accepted", "declined"]).optional(),
  estimatedDeliveryTime: z.string().optional(),
});

const updatePaymentSchema = z.object({
  paymentMethod: z.string().min(1),
  paymentStatus: z.enum(["pending", "completed"]),
});

const createOrderHandler = async (req, res, next) => {
  try {
    const parsed = createOrderSchema.parse(req.body);
    const receiverId = req.user.id || req.user._id;

    const order = await orderService.createOrder({
      ...parsed,
      receiverId,
      requestExpiry: parsed.requestExpiry ? new Date(parsed.requestExpiry) : new Date(Date.now() + 15 * 60 * 1000),
    });

    return res.status(201).json(order);
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ message: "Validation failed", errors: err.errors });
    return next(err);
  }
};

const getMyOrdersHandler = async (req, res, next) => {
  try {
    const receiverId = req.user.id || req.user._id;
    const orders = await orderService.getOrdersByReceiver(receiverId);
    return res.json(orders);
  } catch (err) {
    return next(err);
  }
};

const getProviderOrdersHandler = async (req, res, next) => {
  try {
    const providerId = req.user.id || req.user._id;
    const orders = await orderService.getOrdersByProvider(providerId);
    return res.json(orders);
  } catch (err) {
    return next(err);
  }
};

const updateStatusHandler = async (req, res, next) => {
  try {
    const parsed = updateStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(req.params.id, parsed);
    return res.json(order);
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ message: "Validation failed", errors: err.errors });
    return next(err);
  }
};

const updatePaymentHandler = async (req, res, next) => {
  try {
    const parsed = updatePaymentSchema.parse(req.body);
    const order = await orderService.updateOrderPayment(req.params.id, {
      ...parsed,
      pickupTime: new Date(),
    });
    return res.json(order);
  } catch (err) {
    if (err.name === "ZodError") return res.status(400).json({ message: "Validation failed", errors: err.errors });
    return next(err);
  }
};

const deleteOrderHandler = async (req, res, next) => {
  try {
    const order = await orderService.findOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.providerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your order" });
    }
    await orderService.deleteOrder(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createOrderHandler,
  getMyOrdersHandler,
  getProviderOrdersHandler,
  updateStatusHandler,
  updatePaymentHandler,
  deleteOrderHandler,
};
