import express, { Application } from "express";
import dotenv from "dotenv";
import router from "./routes/alert-routes";
import cors from "cors";

dotenv.config();
const server_port = process.env.SERVER_PORT;
const frontend_port = process.env.FRONTEND_PORT;
const app: Application = express();

app.use(
  cors({
    origin: `http://localhost:${frontend_port}`,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use("/api", router);
app.use(express.json());

app.listen(server_port, () => {
  console.log(`Server running at http://localhost:${server_port}`);
});
