import { notificationRepository } from "../db/repositories/index.js";
import { CreateNotification } from "../db/schemas/index.js";
import { notificationQueue } from "../queues/index.js";
import {
  DEFAULT_NOTIFICATION_RETRY_ATTEMPTS,
  SEND_NOTIFICATION_JOB_NAME,
} from "../utils/constants.js";

export const createNotification = async (notification: CreateNotification) => {
  const res = await notificationRepository.create(notification);

  await notificationQueue.add(
    SEND_NOTIFICATION_JOB_NAME,
    {
      notificationId: res.id,
    },
    {
      attempts: DEFAULT_NOTIFICATION_RETRY_ATTEMPTS,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  );

  return res;
};

export const markNotificationAsDelivered = async (notificationId: string) => {
  const res = await notificationRepository.markDelivered(notificationId);
  return res;
};
