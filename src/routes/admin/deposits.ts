import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { DepositService } from "../../services/deposit";

const AdminDepositRoute = Router();

AdminDepositRoute.get(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, pageSize = 10, status = "", search = "" } = req.query as Record<string, string>;
      const data = await DepositService.listForAdmin({
        page: Number(page),
        pageSize: Number(pageSize),
        status: status || undefined,
        search: search || undefined,
      });
      res.status(200).json({ status: true, message: "Successfully get deposits", data });
    } catch (error) {
      next(error);
    }
  }
);

AdminDepositRoute.get(
  "/:id",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await DepositService.detail(Number(req.params.id));
      res.status(200).json({ status: true, message: "Successfully get deposit detail", data });
    } catch (error) {
      next(error);
    }
  }
);

AdminDepositRoute.patch(
  "/:id/confirm",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.jwt_payload!.user_id;
      const data = await DepositService.confirm(Number(req.params.id), adminId);
      res.status(200).json({ status: true, message: "Deposit approved and balance credited", data });
    } catch (error) {
      next(error);
    }
  }
);

AdminDepositRoute.patch(
  "/:id/reject",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.jwt_payload!.user_id;
      const data = await DepositService.reject(Number(req.params.id), adminId, req.body);
      res.status(200).json({ status: true, message: "Deposit rejected", data });
    } catch (error) {
      next(error);
    }
  }
);

export default AdminDepositRoute;
