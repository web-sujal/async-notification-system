import { Job, Worker } from "bullmq";
import { StatusCodes } from "http-status-codes";

import { config } from "../config/config.js";
import logger from "../config/logger.js";
import { redisConnection } from "../config/redis.js";
import { notificationDlq } from "../queues/notification.dlq.queue.js";
import { notificationService } from "../services/index.js";
import { ApiError } from "../utils/apiError.js";
import {
  DEFAULT_NOTIFICATION_RETRY_ATTEMPTS,
  FAILED_NOTIFICATION_JOB_NAME,
  NOTIFICATION_QUEUE_NAME,
} from "../utils/constants.js";

const processJob = async (job: Job<{ notificationId: string }>) => {
  const { notificationId } = job.data;

  console.log(`▶ Job ${job.id}: delivering notification ${notificationId}`);

  if (config.flags.isFailureModeEnabled && Math.random() < 0.5) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Random error");
  }

  const notification =
    await notificationService.markNotificationAsDelivered(notificationId);

  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
  }

  if (config.flags.isDelayModeEnabled) {
    await new Promise((r) => setTimeout(r, config.flags.delayModeDelay));
  }
};

export const notificationWorker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  processJob,
  { connection: redisConnection },
);

notificationWorker.on("ready", () => {
  console.log(
    `✅ Notification worker ready — listening on "${NOTIFICATION_QUEUE_NAME}"`,
  );
});

notificationWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id}: delivery complete`);
  logger.info(
    `Job ${job.id} completed for notification ${job.data.notificationId}`,
  );
});

notificationWorker.on("failed", async (job, err) => {
  if (!job) {
    console.error(`❌ Job failed: ${err.message}`);
    logger.error("Job failed with no job context:", err);
    return;
  }

  const maxAttempts = job.opts.attempts || DEFAULT_NOTIFICATION_RETRY_ATTEMPTS;
  const currentAttempt = job.attemptsMade;

  if (currentAttempt >= maxAttempts) {
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
      `⚠ Job ${job.id}: moved to DLQ after ${currentAttempt} failed attempt(s)`,
    );
    logger.warn(
      `Job ${job.id} moved to DLQ after ${currentAttempt} failed attempt(s): ${err.message}`,
    );
    return;
  }

  console.error(
    `❌ Job ${job.id}: attempt ${currentAttempt}/${maxAttempts} failed — ${err.message}`,
  );
  logger.error(
    `Job ${job.id} attempt ${currentAttempt}/${maxAttempts} failed: ${err.message}`,
  );
});
