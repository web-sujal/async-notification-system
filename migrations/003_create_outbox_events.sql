CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  aggregate_id UUID NOT NULL,
  aggregate_type TEXT NOT NULL,
  event_type TEXT NOT NULL,

  payload JSONB NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

  FOREIGN KEY (aggregate_id) REFERENCES notifications(id) -- Tightly coupled to notifications table, revert in 004_fix_outbox_tight_coupling.sql
);