-- Migration: Seed "Deposit" menu (USER) and "Deposit Confirmation" menu (Super Admin).
BEGIN;

DO $$
DECLARE
    super_admin_role_id UUID := '40463aa4-1c77-4358-b4e8-02f42b414184';
    user_role_id UUID := 'c788c670-2d0d-42f2-9c56-a60fcb78d859';
    user_menu_id UUID;
    admin_menu_id UUID;
BEGIN
    -- USER: Deposit
    IF NOT EXISTS (SELECT 1 FROM apps.menus WHERE path = '/admin/deposit') THEN
        INSERT INTO apps.menus (name, icon, path, sequence, parent_id, is_active)
        VALUES ('Deposit', 'BiMoneyWithdraw', '/admin/deposit', 5, NULL, true)
        RETURNING id INTO user_menu_id;

        INSERT INTO apps.role_menus (id, role_id, menu_id)
        VALUES (gen_random_uuid(), user_role_id, user_menu_id);
    END IF;

    -- ADMIN: Deposit Confirmation
    IF NOT EXISTS (SELECT 1 FROM apps.menus WHERE path = '/admin/deposit-confirmation') THEN
        INSERT INTO apps.menus (name, icon, path, sequence, parent_id, is_active)
        VALUES ('Deposit Confirmation', 'BiCheckShield', '/admin/deposit-confirmation', 45, NULL, true)
        RETURNING id INTO admin_menu_id;

        INSERT INTO apps.role_menus (id, role_id, menu_id)
        VALUES (gen_random_uuid(), super_admin_role_id, admin_menu_id);
    END IF;
END $$;

COMMIT;
