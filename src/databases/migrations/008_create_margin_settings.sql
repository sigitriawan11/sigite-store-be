-- Migration: Create margin_settings table for dynamic pricing margin
BEGIN;

-- Check if table already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'apps' AND table_name = 'margin_settings'
    ) THEN
        CREATE TABLE apps.margin_settings (
            id BIGSERIAL PRIMARY KEY,
            margin_percent DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
            updated_by BIGINT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Insert default margin (1%)
        INSERT INTO apps.margin_settings (margin_percent)
        VALUES (1.00);
    END IF;
END $$;

COMMIT;