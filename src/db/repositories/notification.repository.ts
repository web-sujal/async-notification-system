import { sql } from "../../config/db.js";
import {
  CreateNotification,
  Notification,
  NotificationRow,
  toNotification,
} from "../schemas/index.js";

export const create = async (
  notification: CreateNotification,
): Promise<Notification> => {
  const [res] = await sql<NotificationRow[]>`
        INSERT INTO notifications (title, content)
        VALUES (
          ${notification.title},
          ${notification.content}
        )

        RETURNING *`;

  return toNotification(res);
};

export const markDelivered = async (
  id: string,
): Promise<Notification | null> => {
  const [res] = await sql<NotificationRow[]>`
          UPDATE notifications
          SET is_delivered = TRUE
          WHERE id = ${id}
          RETURNING *;
        `;

  if (!res) {
    return null;
  }

  return toNotification(res);
};

export const getById = async (id: string): Promise<Notification | null> => {
  const [notif] = await sql<NotificationRow[]>`
        SELECT * FROM notifications WHERE id = ${id};
      `;

  return toNotification(notif);
};
