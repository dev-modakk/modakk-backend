import { z } from "zod";

const imageUrlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

export const slideSchema = z.object({
  image: z.string().url("Must be a valid URL").refine((val) => imageUrlRegex.test(val), {
    message: "URL must point to a direct image (jpg, jpeg, png, gif, webp, svg)"
  }),
  title: z.string().min(1),
  description: z.string().min(1)
});

export const upsertCarouselSchema = z.object({
  slides: z
    .array(slideSchema)
    .min(1, "At least one slide is required.")
    .max(7, "You can upload at most 7 slides.")
});



export type UpsertCarouselInput = z.infer<typeof upsertCarouselSchema>;
