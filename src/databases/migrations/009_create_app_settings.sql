-- Migration: Create app_settings table for storing application configuration
BEGIN;

-- Check if table already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'apps' AND table_name = 'app_settings'
    ) THEN
        CREATE TABLE apps.app_settings (
            id BIGSERIAL PRIMARY KEY,
            setting_key VARCHAR(100) NOT NULL UNIQUE,
            setting_value TEXT NOT NULL,
            "group" VARCHAR(50) NOT NULL DEFAULT 'general',
            description VARCHAR(255),
            updated_by BIGINT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Insert default seed settings
        INSERT INTO apps.app_settings (setting_key, setting_value, "group", description) VALUES
        ('site_name', '"Sigite Store"', 'general', 'The name of the application'),
        ('site_description', '"Top up murah dan terpercaya"', 'general', 'Application tagline or description'),
        ('contact_email', '"admin@sigitestore.com"', 'general', 'Primary contact email'),
        ('contact_phone', '"081234567890"', 'general', 'Primary contact phone number'),
        ('logo_url', '""', 'general', 'URL or path to the application logo'),
        ('allow_registration', 'true', 'system', 'Allow new user registration'),
        ('maintenance_mode', 'false', 'system', 'Enable maintenance mode for the entire site'),
        ('default_role_id', '"40463aa4-1c77-4358-b4e8-02f42b414184"', 'system', 'Default role assigned to new users (USER role UUID)'),
        ('email_verification_required', 'false', 'system', 'Require email verification for new accounts');
    END IF;
END $$;

COMMIT;