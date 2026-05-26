import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import logger from "../config/logger.js";
import { notificationService } from "../services/index.js";
import { sendData } from "../utils/apiSuccess.js";

export const createNotification = async (req: Request, res: Response) => {
  const notification = await notificationService.createNotification(req.body);

  logger.info(`Notification created: ${notification.id}`);

  sendData(res, notification, StatusCodes.CREATED);
  return;
};
