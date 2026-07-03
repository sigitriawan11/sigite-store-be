import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { AuditLogService } from "../../services/audit-log";

const AdminAuditRoute = Router();

AdminAuditRoute.get(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        search = "",
        action = "",
        resource = "",
      } = req.query as {
        page: string;
        pageSize: string;
        search: string;
        action: string;
        resource: string;
      };

      const data = await AuditLogService.list({
        page: Number(page),
        pageSize: Number(pageSize),
        search,
        action: action || undefined,
        resource: resource || undefined,
      });

      res.status(200).json({
        status: true,
        message: "Successfully get audit logs",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default AdminAuditRoute;
