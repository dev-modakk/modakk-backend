import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const createKidsGiftBoxSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters long')
    .max(200, 'Title must not exceed 200 characters'),
  price: z
    .string()
    .regex(/^\$\d+\.\d{2}$/, 'Price must be in format $XX.XX (e.g., $39.95)'),
  box_contains: z
    .string()
    .min(10, 'Box contents description must be at least 10 characters long')
    .max(1000, 'Box contents description must not exceed 1000 characters'),
  reviews_avg: z
    .number()
    .min(1, 'Reviews average must be between 1 and 5')
    .max(5, 'Reviews average must be between 1 and 5'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description must not exceed 2000 characters'),
});

const updateKidsGiftBoxSchema = z
  .object({
    title: z
      .string()
      .min(2, 'Title must be at least 2 characters long')
      .max(200, 'Title must not exceed 200 characters')
      .optional(),
    price: z
      .string()
      .regex(/^\$\d+\.\d{2}$/, 'Price must be in format $XX.XX (e.g., $39.95)')
      .optional(),
    box_contains: z
      .string()
      .min(10, 'Box contents description must be at least 10 characters long')
      .max(1000, 'Box contents description must not exceed 1000 characters')
      .optional(),
    reviews_avg: z
      .number()
      .min(1, 'Reviews average must be between 1 and 5')
      .max(5, 'Reviews average must be between 1 and 5')
      .optional(),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters long')
      .max(2000, 'Description must not exceed 2000 characters')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const validateCreateKidsGiftBox = (req: Request, res: Response, next: NextFunction) => {
  try {
    createKidsGiftBoxSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.issues[0].message,
        details: error.issues,
      });
    }
    next(error);
  }
};

export const validateUpdateKidsGiftBox = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateKidsGiftBoxSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.issues[0].message,
        details: error.issues,
      });
    }
    next(error);
  }
};

export const validateKidsGiftBoxId = (req: Request, res: Response, next: NextFunction) => {
  const idSchema = z.string().transform((val, ctx) => {
    const parsed = parseInt(val);
    if (isNaN(parsed) || parsed <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid gift box ID',
      });
      return z.NEVER;
    }
    return parsed;
  });

  try {
    const id = idSchema.parse(req.params.id);
    req.params.id = id.toString();
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.issues[0].message,
      });
    }
    next(error);
  }
};