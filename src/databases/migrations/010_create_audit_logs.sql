-- Migration: Create audit_logs table for recording admin activity
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'apps' AND table_name = 'audit_logs'
    ) THEN
        CREATE TABLE apps.audit_logs (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID,
            actor_email VARCHAR(255),
            action VARCHAR(20) NOT NULL,
            resource VARCHAR(100),
            resource_id VARCHAR(100),
            method VARCHAR(10),
            path VARCHAR(255),
            status_code INTEGER,
            ip_address VARCHAR(64),
            metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_audit_logs_created_at ON apps.audit_logs (created_at DESC);
        CREATE INDEX idx_audit_logs_resource ON apps.audit_logs (resource);
        CREATE INDEX idx_audit_logs_user_id ON apps.audit_logs (user_id);
    END IF;
END $$;

COMMIT;
