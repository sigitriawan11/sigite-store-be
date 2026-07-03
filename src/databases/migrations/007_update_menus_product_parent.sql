-- Migration: Make Kelola Produk a parent menu with Produk and Kategori children
BEGIN;

-- Update Kelola Produk to be a parent (clear path, it will have children)
UPDATE apps.menus 
SET path = '' 
WHERE id = '5d91a994-f2f3-4c67-83a0-e586b2853240';

-- Insert "Produk" child menu
INSERT INTO apps.menus (id, name, icon, path, sequence, parent_id, is_active)
VALUES (gen_random_uuid(), 'Produk', 'BiGridAlt', '/admin/products', 1, '5d91a994-f2f3-4c67-83a0-e586b2853240', true);

-- Insert "Kategori" child menu
INSERT INTO apps.menus (id, name, icon, path, sequence, parent_id, is_active)
VALUES (gen_random_uuid(), 'Kategori', 'BiGridAlt', '/admin/products/categories', 2, '5d91a994-f2f3-4c67-83a0-e586b2853240', true);

-- Remove old role_menu entry for Kelola Produk parent (Super Admin)
DELETE FROM apps.role_menus WHERE menu_id = '5d91a994-f2f3-4c67-83a0-e586b2853240';

-- Re-add Kelola Produk parent to Super Admin role
INSERT INTO apps.role_menus (role_id, menu_id)
SELECT '40463aa4-1c77-4358-b4e8-02f42b414184', id FROM apps.menus WHERE id = '5d91a994-f2f3-4c67-83a0-e586b2853240'
AND NOT EXISTS (
    SELECT 1 FROM apps.role_menus WHERE role_id = '40463aa4-1c77-4358-b4e8-02f42b414184' AND menu_id = '5d91a994-f2f3-4c67-83a0-e586b2853240'
);

-- Add Produk child to Super Admin role
INSERT INTO apps.role_menus (role_id, menu_id)
SELECT '40463aa4-1c77-4358-b4e8-02f42b414184', id FROM apps.menus WHERE name = 'Produk' AND parent_id = '5d91a994-f2f3-4c67-83a0-e586b2853240'
AND NOT EXISTS (
    SELECT 1 FROM apps.role_menus WHERE role_id = '40463aa4-1c77-4358-b4e8-02f42b414184' AND menu_id = (SELECT id FROM apps.menus WHERE name = 'Produk' AND parent_id = '5d91a994-f2f3-4c67-83a0-e586b2853240')
);

-- Add Kategori child to Super Admin role
INSERT INTO apps.role_menus (role_id, menu_id)
SELECT '40463aa4-1c77-4358-b4e8-02f42b414184', id FROM apps.menus WHERE name = 'Kategori' AND parent_id = '5d91a994-f2f3-4c67-83a0-e586b2853240'
AND NOT EXISTS (
    SELECT 1 FROM apps.role_menus WHERE role_id = '40463aa4-1c77-4358-b4e8-02f42b414184' AND menu_id = (SELECT id FROM apps.menus WHERE name = 'Kategori' AND parent_id = '5d91a994-f2f3-4c67-83a0-e586b2853240')
);

COMMIT;