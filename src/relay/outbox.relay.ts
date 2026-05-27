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

  console.log("🚀 Starting outbox relay...");

  while (isRunning) {
    try {
      const BATCH_SIZE = 20;

      const processedCount = await outboxRepository.processOutboxBatch(
        BATCH_SIZE,
        async (event) => {
          // Add job to notification queue
          await notificationQueue.add(
            SEND_NOTIFICATION_JOB_NAME,
            event.payload,
            {
              jobId: event.aggregateId,
              attempts: DEFAULT_NOTIFICATION_RETRY_ATTEMPTS,
              backoff: {
                type: "exponential",
                delay: 2000,
              },
            },
          );
        },
      );

      // If nothing to process, sleep to prevent CPU/DB thrashing
      if (processedCount === 0) {
        console.log("💤 No pending events found, sleeping for 500ms");
        await sleep(500);
      } else {
        console.log(
          `✅ Successfully published batch of ${processedCount} events.`,
        );
      }
    } catch (err) {
      console.error("Error processing outbox events", err);

      // Sleep for 3 seconds to prevent DB spam
      await sleep(3000);
    }
  }

  console.log("Outbox relay stopped cleanly.");
};
