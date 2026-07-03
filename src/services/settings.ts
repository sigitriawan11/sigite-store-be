import { AppSettingRepository, SettingRow } from "../repositories/settings";
import { ErrNotFound, ErrBadRequest } from "../config/errors";
import { updateSettingsSchema } from "../validation/settings.validation";
import { ZodError } from "zod";

interface GroupedSettings {
  general: Record<string, { id: number; key: string; value: unknown; description: string | null }>;
  system: Record<string, { id: number; key: string; value: unknown; description: string | null }>;
}

function parseSettingValue(value: string): unknown {
  try {
    const parsed = JSON.parse(value);

    if (typeof parsed === "string") {
      if (parsed === "true") return true;
      if (parsed === "false") return false;
      if (!isNaN(Number(parsed)) && parsed.trim() !== "") return Number(parsed);
    }

    return parsed;
  } catch {
    if (value === "true") return true;
    if (value === "false") return false;
    if (!isNaN(Number(value)) && value.trim() !== "") return Number(value);
    return value;
  }
}

function serializeSettingValue(value: unknown): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  return JSON.stringify(value);
}

export class AppSettingService {
  static async getAllSettings(): Promise<GroupedSettings> {
    const settings = await AppSettingRepository.getAll();

    const grouped: GroupedSettings = {
      general: {},
      system: {},
    };

    for (const setting of settings) {
      const group = setting.group === "system" ? "system" : "general";
      grouped[group][setting.setting_key] = {
        id: setting.id,
        key: setting.setting_key,
        value: parseSettingValue(setting.setting_value),
        description: setting.description,
      };
    }

    return grouped;
  }

  static async updateSettings(
    payload: unknown,
    updatedBy?: number
  ): Promise<{
    updated: string[];
    settings: GroupedSettings;
  }> {
    let validated: { settings: Record<string, unknown> };
    try {
      validated = updateSettingsSchema.parse(payload);
    } catch (error) {
      if (error instanceof ZodError) {
        throw error;
      }
      throw new ErrBadRequest("Invalid request body");
    }

    const { settings } = validated;

    if (!settings || Object.keys(settings).length === 0) {
      const current = await this.getAllSettings();
      return { updated: [], settings: current };
    }

    const updates: { key: string; value: string }[] = [];
    const updatedFields: string[] = [];

    for (const [key, value] of Object.entries(settings)) {
      updates.push({
        key,
        value: serializeSettingValue(value),
      });
      updatedFields.push(key);
    }

    await AppSettingRepository.bulkUpdate(updates, updatedBy);

    const current = await this.getAllSettings();
    return { updated: updatedFields, settings: current };
  }

  static async getSetting(key: string): Promise<unknown> {
    const setting = await AppSettingRepository.getByKey(key);
    if (!setting) {
      throw new ErrNotFound(`Setting key '${key}' not found`);
    }
    return parseSettingValue(setting.setting_value);
  }

  static async updateSetting(
    key: string,
    value: unknown,
    updatedBy?: number
  ): Promise<void> {
    await AppSettingRepository.updateByKey(
      key,
      serializeSettingValue(value),
      updatedBy
    );
  }
}