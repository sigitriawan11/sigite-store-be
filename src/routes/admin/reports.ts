import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { AdminReportService } from "../../services/admin-reports";

const AdminReportRoute = Router();

AdminReportRoute.get(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date_from = "", date_to = "" } = req.query as Record<string, string>;

      const data = await AdminReportService.getReport({ date_from, date_to });

      res.status(200).json({
        status: true,
        message: "Successfully get report",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default AdminReportRoute;
