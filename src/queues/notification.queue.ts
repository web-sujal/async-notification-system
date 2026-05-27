import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";

import { redisConnection } from "../config/redis.js";
import { NOTIFICATION_QUEUE_NAME } from "../utils/constants.js";
import { notificationDlq } from "./notification.dlq.queue.js";

export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: redisConnection,
});

export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(notificationQueue),
    new BullMQAdapter(notificationDlq),
  ],
  serverAdapter,
  options: {
    uiConfig: {
      boardTitle: "Notification Queue",
      sortQueues: true,
    },
  },
});
