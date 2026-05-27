import { StatusCodes } from "http-status-codes";

import logger from "../config/logger.js";
import { notificationRepository } from "../db/repositories/index.js";
import { CreateNotification } from "../db/schemas/index.js";
import { ApiError } from "../utils/apiError.js";

export const createNotification = async (notification: CreateNotification) => {
  const notif =
    await notificationRepository.createNotificationWithOutboxEvent(
      notification,
    );

  logger.info(`Notification created: ${notif.id}`);

  return notif;
};

export const markNotificationAsDelivered = async (notificationId: string) => {
  const notif = await notificationRepository.markDelivered(notificationId);

  if (!notif) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
  }

  logger.info(`Notification delivered: ${notificationId}`);

  return notif;
};
