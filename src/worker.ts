import "dotenv/config";

import { connectDb } from "./config/db.js";
import { notificationWorker } from "./workers/notification.worker.js";

async function bootstrap() {
  await connectDb();

  console.log("Notification worker started");

  const shutdown = async () => {
    console.log("Shutting down worker...");
    await notificationWorker.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((err) => {
  console.error("Failed to start worker:", err);
  process.exit(1);
});
