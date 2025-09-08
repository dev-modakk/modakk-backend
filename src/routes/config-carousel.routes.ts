import { Router } from "express";
import { createCarousel, getCarousel, importCarouselFromExcel, putCarousel } from "../controllers";
import { upload } from "../middleware";


const router = Router();

router.get("/", getCarousel);

router.post("/", createCarousel);

router.post("/import", upload.single("file"), importCarouselFromExcel);


router.put("/", putCarousel);

export default router;
