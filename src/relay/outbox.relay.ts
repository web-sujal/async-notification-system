import logger from "../config/logger.js";
import { outboxRepository } from "../db/repositories/index.js";
import { notificationQueue } from "../queues/index.js";
import {
  DEFAULT_NOTIFICATION_RETRY_ATTEMPTS,
  SEND_NOTIFICATION_JOB_NAME,
} from "../utils/constants.js";
import { sleep } from "../utils/index.js";

export const startOutboxRelay = async () => {
  let isRunning = true;

  process.on("SIGINT", () => (isRunning = false));
  process.on("SIGTERM", () => (isRunning = false));

  while (isRunning) {
    try {
      const pendingEvents = await outboxRepository.getOutboxEvents();

      // If nothing to process, sleep to prevent CPU/DB thrashing
      if (pendingEvents.length === 0) {
        logger.info("No pending events found, sleeping for 500ms");

        await sleep(500);
        continue;
      }

      for (const event of pendingEvents) {
        try {
          const { payload } = event;

          // Add job to notification queue
          await notificationQueue.add(SEND_NOTIFICATION_JOB_NAME, payload, {
            jobId: event.aggregateId,
            attempts: DEFAULT_NOTIFICATION_RETRY_ATTEMPTS,
            backoff: {
              type: "exponential",
              delay: 2000,
            },
          });

          // Mark outbox event as processed
          await outboxRepository.markProcessed(event.id);

          console.log(`Job ${event.aggregateId} added to notification queue`);
          console.log(`Outbox event ${event.id} marked as processed`);
        } catch (err) {
          logger.error(`Failed to process outbox event ${event.id}`, err);
        }
      }
    } catch (err) {
      logger.error("Error processing outbox events", err);

      // Sleep for 500ms to avoid busy-waiting
      await sleep(500);
    }
  }

  logger.info("Outbox relay stopped cleanly.");
};
