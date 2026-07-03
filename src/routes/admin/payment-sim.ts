import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { stagingOnlyMiddleware } from "../../middlerware/staging-middleware";
import { AdminPaymentSimService } from "../../services/admin-payment-sim";

const AdminPaymentSimRoute = Router();

AdminPaymentSimRoute.use(stagingOnlyMiddleware, authMiddleware, RoleMiddleware("Super Admin"));

AdminPaymentSimRoute.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, pageSize = 10, search = "" } = req.query as Record<string, string>;

      const data = await AdminPaymentSimService.listPending({
        page: Number(page),
        pageSize: Number(pageSize),
        search,
      });

      res.status(200).json({
        status: true,
        message: "Successfully get pending transactions",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminPaymentSimRoute.post(
  "/:ref_id/pay",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminPaymentSimService.pay(req.params.ref_id as string);

      res.status(200).json({
        status: true,
        message: "Payment simulated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default AdminPaymentSimRoute;
