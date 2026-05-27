import logger from "../config/logger.js";
import { outboxRepository } from "../db/repositories/index.js";
import { notificationQueue } from "../queues/index.js";
import {
  DEFAULT_NOTIFICATION_RETRY_ATTEMPTS,
  SEND_NOTIFICATION_JOB_NAME,
} from "../utils/constants.js";
import { sleep } from "../utils/index.js";

const BATCH_SIZE = 20;
const IDLE_SLEEP_MS = 500;
const ERROR_SLEEP_MS = 3000;

export const startOutboxRelay = async () => {
  let isRunning = true;

  process.on("SIGINT", () => (isRunning = false));
  process.on("SIGTERM", () => (isRunning = false));

  console.log("📤 Outbox relay started — polling for pending events");

  while (isRunning) {
    try {
      const events = await outboxRepository.fetchPendingEvents(BATCH_SIZE);

      if (events.length === 0) {
        await sleep(IDLE_SLEEP_MS);
        continue;
      }

      let publishedCount = 0;

      for (const event of events) {
        await notificationQueue.add(SEND_NOTIFICATION_JOB_NAME, event.payload, {
          jobId: event.aggregateId,
          attempts: DEFAULT_NOTIFICATION_RETRY_ATTEMPTS,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        });

        await outboxRepository.markProcessed(event.id);
        publishedCount++;
      }

      console.log(
        `📤 Published ${publishedCount} event${publishedCount === 1 ? "" : "s"} to queue`,
      );
      logger.info(
        `Outbox batch published: ${publishedCount} event${publishedCount === 1 ? "" : "s"}`,
      );
    } catch (err) {
      console.error(
        "Outbox relay error — retrying in 3s:",
        err instanceof Error ? err.message : err,
      );
      logger.error("Outbox relay error, retrying in 3s:", err);

      await sleep(ERROR_SLEEP_MS);
    }
  }

  console.log("📤 Outbox relay stopped");
};
