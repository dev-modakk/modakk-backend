import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema<any>, place: "body" | "query" | "params" = "body") =>
    (req: Request, res: Response, next: NextFunction) => {
      const target = place === "body" ? req.body : place === "query" ? req.query : req.params;
      const result = schema.safeParse(target);
      if (!result.success) return res.status(400).json({ errors: result.error.issues });
      (req as any)[place] = result.data;
      next();
    };
