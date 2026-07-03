import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { AppSettingService } from "../../services/settings";

const AdminSettingRoute = Router();

AdminSettingRoute.get(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AppSettingService.getAllSettings();

      res.status(200).json({
        status: true,
        message: "Successfully get settings",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminSettingRoute.put(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.jwt_payload?.user_id;
      const result = await AppSettingService.updateSettings(
        req.body,
        currentUserId ? Number(currentUserId) : undefined
      );

      res.status(200).json({
        status: true,
        message: "Settings updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default AdminSettingRoute;