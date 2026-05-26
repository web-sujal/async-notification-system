import { Router } from "express";

import { notificationController } from "../../controllers/index.js";
import { createNotificationSchema } from "../../db/schemas/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../utils/validate.js";

const router = Router();

router.post(
  "/",
  validate(createNotificationSchema),
  asyncHandler(notificationController.createNotification),
);

export default router;
