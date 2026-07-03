-- Migration: Seed "Payment Simulator" admin menu (staging-only tool).
-- The menu row exists in every environment, but the backend menu query hides it
-- (and the API blocks it) unless NODE_ENV=STAGING. See repositories/menu.ts.
BEGIN;

DO $$
DECLARE
    super_admin_role_id UUID := '40463aa4-1c77-4358-b4e8-02f42b414184';
    new_menu_id UUID;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM apps.menus WHERE path = '/admin/payment-sim'
    ) THEN
        INSERT INTO apps.menus (name, icon, path, sequence, parent_id, is_active)
        VALUES ('Payment Simulator', 'BiCreditCard', '/admin/payment-sim', 99, NULL, true)
        RETURNING id INTO new_menu_id;

        INSERT INTO apps.role_menus (id, role_id, menu_id)
        VALUES (gen_random_uuid(), super_admin_role_id, new_menu_id);
    END IF;
END $$;

COMMIT;
