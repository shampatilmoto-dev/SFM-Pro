const { z } = require("zod");

const tokenSchema = z.object({
  token: z.string().min(1)
});

const passwordSchema = z.string().min(12, "Password must be at least 12 characters long");

const authProfileSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  rememberMe: z.boolean().optional().default(false)
});

module.exports = {
  tokenSchema,
  passwordSchema,
  authProfileSchema
};
