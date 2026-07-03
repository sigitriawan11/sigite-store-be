import { Router, Request, Response, NextFunction } from "express";
import { AppSettingService } from "../services/settings";

const PublicSettingRoute = Router();

PublicSettingRoute.get(
  "/public",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const allSettings = await AppSettingService.getAllSettings();

      const publicKeys = [
        "site_name",
        "site_description",
        "logo_url",
        "contact_email",
        "contact_phone",
        "maintenance_mode",
      ];

      const result: Record<string, unknown> = {};

      for (const group of ["general", "system"] as const) {
        for (const [key, setting] of Object.entries(allSettings[group])) {
          if (publicKeys.includes(key)) {
            result[key] = setting.value;
          }
        }
      }

      res.json({
        status: true,
        message: "Public settings fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default PublicSettingRoute;