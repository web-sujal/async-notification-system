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
});

export const updateNotificationSchema = notificationSchema.partial();

// Type exports
export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
