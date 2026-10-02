import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import apiRoutes from "./routes/apiRoutes";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "UP" }));
app.use("/api", apiRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const known = ["not found", "required", "different", "Invalid"];
  const isClientError = known.some(x => err.message.includes(x));
  res.status(isClientError ? 400 : 500).json({ message: err.message || "Internal Server Error" });
});

export default app;
