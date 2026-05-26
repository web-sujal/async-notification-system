import { Queue } from "bullmq";

import { redisConnection } from "../config/redis.js";
import { NOTIFICATION_QUEUE_NAME } from "../utils/constants.js";

export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: redisConnection,
});
