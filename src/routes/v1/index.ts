import { Router } from "express";
import notificationRouter from "./notification.route.js";

export const v1Router = Router();

v1Router.use("/notifications", notificationRouter);
