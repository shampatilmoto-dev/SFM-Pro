const { z } = require("zod");

const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid identifier")
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().trim().min(1).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

const dateRangeSchema = z.object({
  from: z.string().trim().optional(),
  to: z.string().trim().optional()
});

module.exports = {
  uuidParamSchema,
  paginationSchema,
  dateRangeSchema
};
