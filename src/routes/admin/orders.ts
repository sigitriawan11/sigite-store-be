import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { AdminOrderService } from "../../services/admin-orders";

const AdminOrderRoute = Router();

AdminOrderRoute.get(
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
        date_from = "",
        date_to = "",
      } = req.query as Record<string, string>;

      const data = await AdminOrderService.list({
        page: Number(page),
        pageSize: Number(pageSize),
        search,
        status: status || undefined,
        date_from: date_from || undefined,
        date_to: date_to || undefined,
      });

      res.status(200).json({
        status: true,
        message: "Successfully get order list",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminOrderRoute.get(
  "/:ref_id",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminOrderService.detail(req.params.ref_id as string);

      res.status(200).json({
        status: true,
        message: "Successfully get order detail",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminOrderRoute.patch(
  "/:ref_id/status",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminOrderService.updateStatus(
        req.params.ref_id as string,
        req.body
      );

      res.status(200).json({
        status: true,
        message: "Order status updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default AdminOrderRoute;
