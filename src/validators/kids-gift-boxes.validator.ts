import { z } from "zod";

const imageUrlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

export const createGiftBoxSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().positive(),
  image: z.string().url(),
  badge: z.string().max(50).optional(),
  rating: z.number().min(0).max(5),
  reviews: z.number().int().min(0).optional(),
  isWishlisted: z.boolean().optional(),
  isSoldOut: z.boolean().optional(),
  images: z.array(z.string().url()).max(12).optional(),
  category: z.enum(['GB', 'TY', 'BK', 'GM', 'CL', 'AC']).optional()
});


export const imagesBodySchema = z.object({
  images: z.array(
    z.string().url("Must be a valid URL")
      .refine(u => imageUrlRegex.test(u), "URL must be a direct image (jpg/jpeg/png/gif/webp/svg)")
  )
    .min(1, "At least one image is required.")
    .max(12, "You can attach at most 12 images.")
});

export interface IDConfig {
  strategy: 'hybrid' | 'alphanumeric' | 'timestamp';
  prefix: string;
  allowedCategories: string[];
}

export const idConfig: IDConfig = {
  strategy: process.env.ID_STRATEGY as IDConfig['strategy'] || 'hybrid',
  prefix: process.env.ID_PREFIX || 'MDK',
  allowedCategories: ['GB', 'TY', 'BK', 'GM', 'CL', 'AC']
};

export const updateGiftBoxSchema = createGiftBoxSchema.partial();

export type CreateGiftBoxInput = z.infer<typeof createGiftBoxSchema>;
export type UpdateGiftBoxInput = z.infer<typeof updateGiftBoxSchema>;
