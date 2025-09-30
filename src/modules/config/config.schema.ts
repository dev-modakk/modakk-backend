import { z } from "zod";
export const upsertConfigSchema = z.object({
  env: z.string().default("prod"),
  name: z.string().min(1),
  key: z.string().min(1),
  value: z.any(),
});
export const getConfigQuery = z.object({
  env: z.string().default("prod")
});
