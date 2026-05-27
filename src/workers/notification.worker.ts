import { Worker } from "bullmq";
import { StatusCodes } from "http-status-codes";

import { redisConnection } from "../config/redis.js";
import { notificationService } from "../services/index.js";
import { ApiError } from "../utils/apiError.js";
import { NOTIFICATION_QUEUE_NAME } from "../utils/constants.js";

export const notificationWorker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  async (job) => {
    const { notificationId } = job.data as { notificationId: string };

    console.log(`⏩ Processing notification ${notificationId}`);

    const notification =
      await notificationService.markNotificationAsDelivered(notificationId);

    if (!notification) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
    }

    console.log(`✅ Notification ${notificationId} marked as delivered`);
    return;
  },
  { connection: redisConnection },
);

notificationWorker.on("ready", () => {
  console.log("✅ Worker connected and waiting for jobs");
});

notificationWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

notificationWorker.on("failed", (job, err) => {
  console.log(`🔴 Job ${job?.id ?? "unknown"} failed: ${err.message}`);
});
