import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { notificationService } from "../services/index.js";
import { sendData } from "../utils/apiSuccess.js";

export const createNotification = async (req: Request, res: Response) => {
  const notification = await notificationService.createNotification(req.body);

  sendData(res, notification, StatusCodes.CREATED);
  return;
};
