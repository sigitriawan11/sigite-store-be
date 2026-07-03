import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { AdminDashboardService } from "../../services/admin-dashboard";

const AdminDashboardRoute = Router();

AdminDashboardRoute.get(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminDashboardService.getSummary();

      res.status(200).json({
        status: true,
        message: "Successfully get dashboard summary",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default AdminDashboardRoute;
