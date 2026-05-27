import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import morgan from "morgan";

import { config } from "./config/config.js";
import { connectDb } from "./config/db.js";
import logger from "./config/logger.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { serverAdapter } from "./queues/notification.queue.js";
import { v1Router } from "./routes/v1/index.js";
import { sendData } from "./utils/apiSuccess.js";

const app = express();

app.use(helmet());

app.use(morgan(config.server.nodeEnv === "production" ? "combined" : "dev"));

// CORS: allow explicit origins from CORS_ORIGINS, or "*" = allow all, or in dev with no env = allow all.
const allowAllOrigins =
  config.cors.origins.length === 0 ||
  (config.cors.origins.length === 1 && config.cors.origins[0] === "*");

const corsOrigin = allowAllOrigins
  ? true
  : config.cors.origins.map((o) => o.replace(/\/$/, "")); // strip trailing slash

app.use(
  cors({
    origin: corsOrigin,
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/admin/queues", serverAdapter.getRouter());

app.get("/health", (_req, res) => {
  logger.info("health check");
  return sendData(res, { status: "ok", message: "Server is running" });
});

// Handle favicon requests
app.get("/favicon.ico", (_req, res) => {
  return sendData(res, undefined, StatusCodes.NO_CONTENT);
});

app.use("/api/v1", v1Router);

app.use(errorHandler);

async function bootstrap() {
  await connectDb();

  app.listen(config.server.port, () => {
    console.log(
      `🚀 API server listening on http://localhost:${config.server.port}`,
    );
    logger.info(`Server running on http://localhost:${config.server.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start API server:", err);
  process.exit(1);
});
