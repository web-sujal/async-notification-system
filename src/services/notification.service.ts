import { notificationRepository } from "../db/repositories/index.js";
import { CreateNotification } from "../db/schemas/index.js";

export const createNotification = async (notification: CreateNotification) => {
  const notif =
    await notificationRepository.createNotificationWithOutboxEvent(
      notification,
    );

  return notif;
};

export const markNotificationAsDelivered = async (notificationId: string) => {
  const res = await notificationRepository.markDelivered(notificationId);
  return res;
};
