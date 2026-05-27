import { Queue } from "bullmq";

import { redisConnection } from "../config/redis.js";
import { NOTIFICATION_DQL_QUEUE_NAME } from "../utils/constants.js";

export const notificationDlq = new Queue(NOTIFICATION_DQL_QUEUE_NAME, {
  connection: redisConnection,
});
