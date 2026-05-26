import { Router } from "express";
import notificationRoute from "./notification.route.js";

export const v1Router = Router();

v1Router.use("/notifications", notificationRoute);
