import { AppSetting } from "../databases/main.db";
import { ErrNotFound } from "../config/errors";

export interface SettingRow {
  id: number;
  setting_key: string;
  setting_value: string;
  group: string;
  description: string | null;
  updated_by: number | null;
  created_at: Date;
  updated_at: Date;
}

export class AppSettingRepository {
  static async getAll(): Promise<SettingRow[]> {
    const settings = await AppSetting.findAll({
      order: [["group", "ASC"], ["id", "ASC"]],
    });
    return settings.map((s) => s.toJSON() as SettingRow);
  }

  static async getByKey(key: string): Promise<SettingRow | null> {
    const setting = await AppSetting.findOne({
      where: { setting_key: key },
    });
    if (!setting) return null;
    return setting.toJSON() as SettingRow;
  }

  static async updateByKey(
    key: string,
    value: string,
    updatedBy?: number
  ): Promise<SettingRow> {
    const setting = await AppSetting.findOne({
      where: { setting_key: key },
    });

    if (!setting) {
      throw new ErrNotFound(`Setting key '${key}' not found`);
    }

    setting.set("setting_value", value);
    if (updatedBy) {
      setting.set("updated_by", updatedBy);
    }
    setting.set("updated_at", new Date());

    await setting.save();
    return setting.toJSON() as SettingRow;
  }

  static async bulkUpdate(
    updates: { key: string; value: string }[],
    updatedBy?: number
  ): Promise<SettingRow[]> {
    const results: SettingRow[] = [];

    for (const { key, value } of updates) {
      const result = await this.updateByKey(key, value, updatedBy);
      results.push(result);
    }

    return results;
  }
}