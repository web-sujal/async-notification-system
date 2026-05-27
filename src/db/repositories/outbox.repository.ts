import type { Sql, TransactionSql } from "postgres";

import { sql } from "../../config/db.js";
import {
  CreateOutboxEvent,
  OutboxEvent,
  OutboxEventRow,
  toOutboxEvent,
} from "../schemas/outbox.schema.js";

export const insertOutboxEvent = (
  tx: Sql | TransactionSql,
  data: CreateOutboxEvent,
) =>
  tx`
    INSERT INTO outbox_events (
      aggregate_id,
      aggregate_type,
      event_type,
      payload
    )
    VALUES (
      ${data.aggregateId},
      ${data.aggregateType},
      ${data.eventType},
      ${sql.json(data.payload)}
    );
  `;

export const getOutboxEvents = async (
  batchSize = 20,
): Promise<OutboxEvent[]> => {
  const outboxEvents = await sql.begin<OutboxEventRow[]>((tx) => {
    return tx`
      SELECT * FROM outbox_events
      WHERE processed_at IS NULL
      ORDER BY created_at ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED;`;
  });

  if (outboxEvents.length === 0) {
    return [];
  }

  return outboxEvents.map(toOutboxEvent);
};

export const markProcessed = async (id: string) => {
  await sql`
    UPDATE outbox_events
    SET processed_at = now()
    WHERE id = ${id}
  `;

  return;
};
