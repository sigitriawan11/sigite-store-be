import { QueryTypes } from "sequelize";
import { sequelize_main } from "../databases/main.db";

export interface MenuItem {
    id: string;
    name: string;
    icon: string;
    path: string;
    sequence: number;
    parent_id: string | null;
    children?: MenuItem[];
}

export class MenuRepositories {
    static async getMenusByRoleId(roleId: string): Promise<MenuItem[]> {
        const menus = await sequelize_main.query<MenuItem>(
            `SELECT m.id, m.name, m.icon, m.path, m.sequence, m.parent_id
             FROM apps.menus m
             INNER JOIN apps.role_menus rm ON rm.menu_id = m.id
             WHERE rm.role_id = :role_id
               AND m.is_active = true
               AND m.deleted_at IS NULL
             ORDER BY m.sequence ASC`,
            {
                replacements: { role_id: roleId },
                type: QueryTypes.SELECT,
            }
        );

        
        const menuMap = new Map<string, MenuItem>();
        const rootMenus: MenuItem[] = [];

        for (const menu of menus) {
            menuMap.set(menu.id, { ...menu, children: [] });
        }

        for (const menu of menus) {
            const item = menuMap.get(menu.id)!;
            if (menu.parent_id && menuMap.has(menu.parent_id)) {
                menuMap.get(menu.parent_id)!.children!.push(item);
            } else {
                rootMenus.push(item);
            }
        }

        return rootMenus;
    }
}