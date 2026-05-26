import { z } from "zod";

export const notificationSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  content: z.string(),
  isSeen: z.boolean().default(false),
  isDelivered: z.boolean().default(false),
  createdAt: z.date(),
});

export const createNotificationSchema = notificationSchema.omit({
  id: true,
  createdAt: true,
  isSeen: true,
  isDelivered: true,
});

export const updateNotificationSchema = notificationSchema.partial();

// Type exports
export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;

// Database row types
export type NotificationRow = {
  id: string;
  title: string;
  content: string;
  is_seen: boolean;
  is_delivered: boolean;
  created_at: Date;
};

export const toNotification = (row: NotificationRow): Notification => {
  return notificationSchema.parse({
    id: row.id,
    title: row.title,
    content: row.content,
    isSeen: row.is_seen,
    isDelivered: row.is_delivered,
    createdAt: row.created_at,
  });
};
