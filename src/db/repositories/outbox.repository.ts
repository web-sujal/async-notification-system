import type { Sql, TransactionSql } from "postgres";

import { sql } from "../../config/db.js";
import { CreateOutboxEvent } from "../schemas/outbox.schema.js";

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
