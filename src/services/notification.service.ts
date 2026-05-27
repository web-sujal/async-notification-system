import { notificationRepository } from "../db/repositories/index.js";
import { CreateNotification } from "../db/schemas/index.js";
import { notificationQueue } from "../queues/index.js";
import {
  DEFAULT_NOTIFICATION_RETRY_ATTEMPTS,
  SEND_NOTIFICATION_JOB_NAME,
} from "../utils/constants.js";

export const createNotification = async (notification: CreateNotification) => {
  const notif = await notificationRepository.create(notification);

  await notificationQueue.add(
    SEND_NOTIFICATION_JOB_NAME,
    {
      notificationId: notif.id,
    },
    {
      attempts: DEFAULT_NOTIFICATION_RETRY_ATTEMPTS,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      jobId: notif.id,
    },
  );

  return notif;
};

export const markNotificationAsDelivered = async (notificationId: string) => {
  const res = await notificationRepository.markDelivered(notificationId);
  return res;
};
