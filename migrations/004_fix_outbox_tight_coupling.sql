ALTER TABLE outbox_events
DROP CONSTRAINT IF EXISTS outbox_events_aggregate_id_fkey;

-- Add index to optimize background worker polling
CREATE INDEX IF NOT EXISTS idx_outbox_events_unprocessed 
ON outbox_events (created_at ASC) 
WHERE processed_at IS NULL;