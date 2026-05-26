import { sql } from "../../config/db.js";
import {
  CreateNotification,
  Notification,
  NotificationRow,
  toNotification,
} from "../schemas/index.js";

export const notificationRepository = {
  create: async (notification: CreateNotification): Promise<Notification> => {
    const [res] = await sql<NotificationRow[]>`
        INSERT INTO notifications (title, content)
        VALUES (
          ${notification.title},
          ${notification.content}
        )

        RETURNING *`;

    return toNotification(res);
  },
};
