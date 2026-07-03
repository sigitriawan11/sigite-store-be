import { MarginSetting } from "../databases/main.db";
import { ErrNotFound } from "../config/errors";

export class PricingService {
  static async getMargin(): Promise<{ id: number; margin_percent: number }> {
    const setting = await MarginSetting.findOne({
      order: [["id", "ASC"]],
      raw: true,
    });

    if (!setting) {
      const created = await MarginSetting.create({
        margin_percent: 1.0,
      });
      return {
        id: created.id,
        margin_percent: Number(created.margin_percent),
      };
    }

    return {
      id: setting.id,
      margin_percent: Number(setting.margin_percent),
    };
  }

  static async updateMargin(
    marginPercent: number,
    updatedBy?: number | null
  ): Promise<{ id: number; margin_percent: number }> {
    const numericPercent = Number(marginPercent);

    if (isNaN(numericPercent) || numericPercent < 0) {
      throw new ErrNotFound("Invalid margin percentage");
    }

    const setting = await MarginSetting.findOne({
      order: [["id", "ASC"]],
    });

    if (!setting) {
        const created = await MarginSetting.create({
            margin_percent: numericPercent,
            updated_by: updatedBy ?? null,
        });
        return {
            id: created.id,
            margin_percent: Number(created.margin_percent),
        };
    }
    
    setting.margin_percent = numericPercent;
    setting.updated_by = updatedBy ?? null;
    setting.updated_at = new Date();
    await setting.save();
    
    return {
      id: setting.id,
      margin_percent: Number(setting.margin_percent),
    };
  }

  static async calculatePrice(basePrice: number): Promise<number> {
    const margin = await this.getMargin();
    return Math.ceil(basePrice + basePrice * (margin.margin_percent / 100));
  }

  static calculatePriceFromMargin(
    basePrice: number,
    marginPercent: number
  ): number {
    return Math.ceil(basePrice + basePrice * (marginPercent / 100));
  }
}