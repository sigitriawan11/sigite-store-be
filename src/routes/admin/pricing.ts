import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { PricingService } from "../../services/pricing";

const AdminPricingRoute = Router();

AdminPricingRoute.get(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin", "User"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const margin = await PricingService.getMargin();

      res.status(200).json({
        status: true,
        message: "Successfully get margin setting",
        data: margin,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminPricingRoute.put(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin", "User"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { margin_percent } = req.body;
      const updatedBy = req.jwt_payload?.user_id ?? null;

      const margin = await PricingService.updateMargin(
        margin_percent,
        updatedBy
      );

      res.status(200).json({
        status: true,
        message: "Successfully update margin setting",
        data: margin,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default AdminPricingRoute;