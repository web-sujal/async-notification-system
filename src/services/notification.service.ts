import { notificationRepository } from "../db/repositories/index.js";
import { CreateNotification } from "../db/schemas/index.js";

export const createNotification = async (notification: CreateNotification) => {
  const res = await notificationRepository.create(notification);
  return res;
};
