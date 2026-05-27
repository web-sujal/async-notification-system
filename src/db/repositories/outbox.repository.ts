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

export const fetchPendingEvents = async (
  batchSize = 20,
): Promise<OutboxEvent[]> => {
  const rows = await sql<OutboxEventRow[]>`
    SELECT * FROM outbox_events
    WHERE processed_at IS NULL
    ORDER BY created_at ASC
    LIMIT ${batchSize};
  `;

  return rows.map(toOutboxEvent);
};

export const markProcessed = async (id: string): Promise<void> => {
  await sql`
    UPDATE outbox_events
    SET processed_at = now()
    WHERE id = ${id}
      AND processed_at IS NULL;
  `;
};
