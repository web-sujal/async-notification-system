import { notificationRepository } from "../db/repositories/index.js";
import { CreateNotification } from "../db/schemas/index.js";
import { notificationQueue } from "../queues/index.js";
import { SEND_NOTIFICATION_JOB_NAME } from "../utils/constants.js";

export const createNotification = async (notification: CreateNotification) => {
  const res = await notificationRepository.create(notification);

  await notificationQueue.add(SEND_NOTIFICATION_JOB_NAME, {
    notificationId: res.id,
  });

  return res;
};
