import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/spec";
import configCarouselRoutes from "./routes/config-carousel.routes";
import kidsGiftBoxRoutes from "./routes/kids-gift-boxes.route";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/config/carousel", configCarouselRoutes);
app.use("/api/v1/kidsgiftboxes", kidsGiftBoxRoutes);


export default app;
