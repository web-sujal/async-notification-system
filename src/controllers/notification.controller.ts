import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { notificationService } from "../services/index.js";
import { sendData } from "../utils/apiSuccess.js";

export const createNotification = async (req: Request, res: Response) => {
  const result = await notificationService.createNotification(req.body);

  sendData(res, result, StatusCodes.CREATED);
  return;
};
