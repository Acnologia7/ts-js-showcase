import express, { Application } from "express";
import dotenv from "dotenv";
import router from "./routes/alert-routes";
import cors from "cors";

dotenv.config();
const port = process.env.SERVER_PORT;

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use("/api", router);
app.use(express.json());

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
