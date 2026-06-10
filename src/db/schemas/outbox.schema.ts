import { z } from "zod";

export const outboxEventSchema = z.object({
  id: z.uuid(),

  aggregateId: z.uuid(),
  aggregateType: z.string(),
  eventType: z.string(),

  payload: z.record(z.string(), z.unknown()),

  createdAt: z.date(),
  processedAt: z.date().nullable(),
});

export const createOutboxEventSchema = outboxEventSchema.omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const updateOutboxEventSchema = outboxEventSchema.partial();

// Type exports
export type OutboxEvent = z.infer<typeof outboxEventSchema>;
export type CreateOutboxEvent = z.infer<typeof createOutboxEventSchema>;
export type UpdateOutboxEvent = z.infer<typeof updateOutboxEventSchema>;

// Database row types
export type OutboxEventRow = {
  id: string;

  aggregate_id: string;
  aggregate_type: string;
  event_type: string;

  payload: Record<string, unknown>;

  created_at: Date;
  processed_at: Date | null;
};

export const toOutboxEvent = (row: OutboxEventRow): OutboxEvent => {
  return outboxEventSchema.parse({
    id: row.id,

    aggregateId: row.aggregate_id,
    aggregateType: row.aggregate_type,
    eventType: row.event_type,

    payload: row.payload,

    createdAt: row.created_at,
    processedAt: row.processed_at,
  });
};
