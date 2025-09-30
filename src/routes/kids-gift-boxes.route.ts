import { Router } from "express";
import { createKidsGiftBox, getKidsGiftBox, addKidsGiftBoxImages, replaceKidsGiftBoxImages, deleteKidsGiftBoxImages, listGiftBoxes } from "../controllers";
import {
  bulkImportMiddleware,
  bulkImportKidsGiftBoxes,
  downloadBulkImportTemplate,
} from "../controllers/";
const router = Router();

router.post("/", createKidsGiftBox);
router.get("/", listGiftBoxes);
router.get("/:id", getKidsGiftBox);

router.get("/bulkimport/template", downloadBulkImportTemplate);
router.post(
  "/bulkimport",
  bulkImportMiddleware,
  bulkImportKidsGiftBoxes
);

router.post("/:id/images", addKidsGiftBoxImages);
router.put("/:id/images", replaceKidsGiftBoxImages);
router.delete("/:id/images", deleteKidsGiftBoxImages);

export default router;
