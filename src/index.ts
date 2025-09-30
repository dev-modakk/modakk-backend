import app from "./app";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger UI on http://localhost:${port}/docs`);
});
