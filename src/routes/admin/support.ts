import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { SupportService } from "../../services/support";

const AdminSupportRoute = Router();

AdminSupportRoute.get(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        search = "",
        status = "",
      } = req.query as Record<string, string>;

      const data = await SupportService.list({
        page: Number(page),
        pageSize: Number(pageSize),
        search,
        status: status || undefined,
      });

      res.status(200).json({
        status: true,
        message: "Successfully get ticket list",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminSupportRoute.get(
  "/:id",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await SupportService.detail(Number(req.params.id));

      res.status(200).json({
        status: true,
        message: "Successfully get ticket detail",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminSupportRoute.patch(
  "/:id/status",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await SupportService.updateStatus(Number(req.params.id), req.body);

      res.status(200).json({
        status: true,
        message: "Ticket status updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminSupportRoute.post(
  "/:id/reply",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await SupportService.reply(Number(req.params.id), req.body, {
        user_id: req.jwt_payload?.user_id,
        name: "Admin",
      });

      res.status(201).json({
        status: true,
        message: "Reply sent successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default AdminSupportRoute;
