-- Migration: link transactions to the user who created them (nullable for guest orders).
BEGIN;

ALTER TABLE apps.transactions ADD COLUMN IF NOT EXISTS user_id UUID;
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON apps.transactions (user_id);

COMMIT;
