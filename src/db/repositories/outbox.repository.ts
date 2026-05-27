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

export const processOutboxBatch = async (
  batchSize = 20,
  callback: (event: OutboxEvent) => Promise<void>,
): Promise<number> => {
  return sql.begin(async (tx) => {
    // Lock rows for update to prevent race conditions
    const rows = await tx<OutboxEventRow[]>`
      SELECT * FROM outbox_events
      WHERE processed_at IS NULL
      ORDER BY created_at ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED;
    `;

    if (rows.length === 0) {
      return 0;
    }

    const events = rows.map(toOutboxEvent);

    for (const event of events) {
      // Execute the BullMQ push operation via callback
      await callback(event);

      // Mark outbox event as processed
      await tx`
        UPDATE outbox_events
        SET processed_at = now()
        WHERE id = ${event.id}
      `;
    }

    return events.length;
  });
};
