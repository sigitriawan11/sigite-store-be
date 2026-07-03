-- Migration: Create deposits table for manual balance top-up (with transfer proof)
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'apps' AND table_name = 'deposits'
    ) THEN
        CREATE TABLE apps.deposits (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID NOT NULL,
            amount NUMERIC(12,2) NOT NULL,
            method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
            sender_name VARCHAR(150),
            proof_url TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
            admin_note TEXT,
            confirmed_by UUID,
            confirmed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_deposits_status ON apps.deposits (status);
        CREATE INDEX idx_deposits_user_id ON apps.deposits (user_id);
        CREATE INDEX idx_deposits_created_at ON apps.deposits (created_at DESC);
    END IF;
END $$;

COMMIT;
