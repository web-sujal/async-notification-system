import type { Sql, TransactionSql } from "postgres";

import { sql } from "../../config/db.js";
import {
  CreateNotification,
  CreateOutboxEvent,
  Notification,
  NotificationRow,
  toNotification,
} from "../schemas/index.js";
import { insertOutboxEvent } from "./outbox.repository.js";

const insertNotification = (
  tx: Sql | TransactionSql,
  data: CreateNotification,
) =>
  tx<NotificationRow[]>`
    INSERT INTO notifications (title, content)
    VALUES (
      ${data.title},
      ${data.content}
    )

    RETURNING *;
  `;

export const create = async (
  notification: CreateNotification,
): Promise<Notification> => {
  const [res] = await insertNotification(sql, notification);
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

  if (!notif) {
    return null;
  }

  return toNotification(notif);
};

export const createNotificationWithOutboxEvent = async (
  notification: CreateNotification,
  outboxEvent: Omit<CreateOutboxEvent, "aggregateId">,
): Promise<Notification> => {
  return sql.begin(async (tx) => {
    // Create notification
    const [createdNotif] = await insertNotification(tx, notification);

    // Create outbox event
    await insertOutboxEvent(tx, {
      ...outboxEvent,
      aggregateId: createdNotif.id,
    });

    // Return notification
    return toNotification(createdNotif);
  });
};
