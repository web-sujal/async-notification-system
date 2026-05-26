import { Worker } from "bullmq";

import { redisConnection } from "../config/redis.js";
import { NOTIFICATION_QUEUE_NAME } from "../utils/constants.js";

export const notificationWorker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  async (job) => {
    const { notificationId } = job.data as { notificationId: string };
    console.log(`Sending notification ${notificationId}`);
  },
  { connection: redisConnection },
);

notificationWorker.on("ready", () => {
  console.log("Worker connected and waiting for jobs");
});

notificationWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

notificationWorker.on("failed", (job, err) => {
  console.log(`Job ${job?.id ?? "unknown"} failed: ${err.message}`);
});
