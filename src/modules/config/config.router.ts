import { Router } from "express";
import * as svc from "./config.service";
import { validate } from "../validate";
import { getConfigQuery, upsertConfigSchema } from "./config.schema";

export const configRouter = Router();

configRouter.put("/:name", validate(upsertConfigSchema), async (req, res, next) => {
  try {
    const { env, key, value } = req.body;
    const item = await svc.upsert(env, req.params.name, key, value);
    res.json(item);
  } catch (e) { next(e); }
});

configRouter.get("/:name", validate(getConfigQuery, "query"), async (req, res, next) => {
  try {
    const items = await svc.get(req.query.env as string, req.params.name);
    res.json({ items });
  } catch (e) { next(e); }
});
