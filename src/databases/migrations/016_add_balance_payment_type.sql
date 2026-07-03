-- Migration: add 'BALANCE' to apps.payment_type enum (pay from wallet balance).
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block, so this
-- file intentionally has no BEGIN/COMMIT.
ALTER TYPE apps.payment_type ADD VALUE IF NOT EXISTS 'BALANCE';
