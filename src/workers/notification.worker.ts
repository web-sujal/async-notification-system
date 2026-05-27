import { Job, Worker } from "bullmq";
import { StatusCodes } from "http-status-codes";

import { redisConnection } from "../config/redis.js";
import { notificationDlq } from "../queues/notification.dlq.queue.js";
import { notificationService } from "../services/index.js";
import { ApiError } from "../utils/apiError.js";
import {
  DEFAULT_NOTIFICATION_RETRY_ATTEMPTS,
  FAILED_NOTIFICATION_JOB_NAME,
  NOTIFICATION_QUEUE_NAME,
} from "../utils/constants.js";
import { config } from "../config/config.js";

const processJob = async (job: Job<{ notificationId: string }>) => {
  if (config.flags.isFailureModeEnabled && Math.random() < 0.5) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Random error");
  }

  const { notificationId } = job.data;
  console.log("🚀 ~ processJob ~ job:", job.opts);

  console.log(`⏩ Processing notification ${notificationId}`);

  const notification =
    await notificationService.markNotificationAsDelivered(notificationId);

  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
  }

  if (config.flags.isDelayModeEnabled) {
    await new Promise((r) => setTimeout(r, config.flags.delayModeDelay));
  }
  console.log(`✅ Notification ${notificationId} marked as delivered`);
  return;
};

export const notificationWorker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  processJob,
  { connection: redisConnection },
);

notificationWorker.on("ready", () => {
  console.log("✅ Worker connected and waiting for jobs");
});

notificationWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

notificationWorker.on("failed", async (job, err) => {
  console.log(`🔴 Job ${job?.id ?? "unknown"} failed: ${err.message}`);

  if (!job) return;

  const maxAttempts = job.opts.attempts || DEFAULT_NOTIFICATION_RETRY_ATTEMPTS;
  const currentAttempt = job.attemptsMade;

  if (currentAttempt >= maxAttempts) {
    // Move to DLQ
    await notificationDlq.add(FAILED_NOTIFICATION_JOB_NAME, {
      originalJob: {
        id: job.id,
        name: job.name,
        data: job.data,
        opts: job.opts,
      },
      failure: {
        reason: err.message,
        stackTrace:
          (err as any).stackTrace ?? err.stack ?? "Unknown stack trace",
        attemptsMade: currentAttempt,
        failedAt: new Date().toISOString(),
      },
    });

    console.log(
      `🟡 Job ${job.id} moved to DLQ after ${currentAttempt} attempts`,
    );
    return;
  }
});
