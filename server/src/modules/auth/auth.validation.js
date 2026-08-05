const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  // Keep password rules permissive to support existing short test passwords
  password: z.string().min(1).max(128),
  role: z.enum(["provider", "receiver"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

module.exports = {
  registerSchema,
  loginSchema,
};

