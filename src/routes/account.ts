import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../middlerware/auth-middleware";
import { AccountService } from "../services/account";
import { DepositService } from "../services/deposit";
import { SupportService } from "../services/support";
import { TransactionService } from "../services/transaction";
import { multerMiddleware } from "../config/multer";
import { ErrBadRequest } from "../config/errors";

const AccountRoute = Router();

AccountRoute.get(
  "/dashboard",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, email } = req.jwt_payload!;
      const data = await AccountService.dashboard(user_id, email);
      res.status(200).json({ status: true, message: "Successfully get dashboard", data });
    } catch (error) {
      next(error);
    }
  }
);

AccountRoute.get(
  "/transactions",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, email } = req.jwt_payload!;
      const { page = 1, pageSize = 10, status = "", search = "" } = req.query as Record<string, string>;
      const data = await AccountService.transactions(user_id, email, {
        page: Number(page),
        pageSize: Number(pageSize),
        status: status || undefined,
        search: search || undefined,
      });
      res.status(200).json({ status: true, message: "Successfully get transactions", data });
    } catch (error) {
      next(error);
    }
  }
);

AccountRoute.get(
  "/wallet",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.jwt_payload!;
      const { page = 1, pageSize = 10 } = req.query as Record<string, string>;
      const data = await AccountService.wallet(user_id, Number(page), Number(pageSize));
      res.status(200).json({ status: true, message: "Successfully get wallet", data });
    } catch (error) {
      next(error);
    }
  }
);

AccountRoute.post(
  "/orders/balance",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.jwt_payload!;
      const { product_code, phone, email, account_data } = req.body ?? {};

      if (!product_code || !phone || !email) {
        throw new ErrBadRequest("product_code, phone and email are required");
      }

      const data = await TransactionService.createOrderWithBalance(user_id, {
        product_code,
        phone,
        email,
        account_data: account_data ?? {},
      });

      res.status(201).json({
        status: true,
        message: "Order paid with balance successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AccountRoute.post(
  "/deposits",
  authMiddleware,
  multerMiddleware.single("proof"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.jwt_payload!;
      const proofUrl = req.file ? `/uploads/${req.file.filename}` : null;
      const data = await DepositService.create(user_id, req.body, proofUrl);
      res.status(201).json({ status: true, message: "Deposit submitted, waiting for confirmation", data });
    } catch (error) {
      next(error);
    }
  }
);

AccountRoute.get(
  "/deposits",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.jwt_payload!;
      const { page = 1, pageSize = 10, status = "" } = req.query as Record<string, string>;
      const data = await DepositService.listForUser(user_id, {
        page: Number(page),
        pageSize: Number(pageSize),
        status: status || undefined,
      });
      res.status(200).json({ status: true, message: "Successfully get deposits", data });
    } catch (error) {
      next(error);
    }
  }
);

AccountRoute.get(
  "/support",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.jwt_payload!;
      const { page = 1, pageSize = 10, status = "", search = "" } = req.query as Record<string, string>;
      const data = await SupportService.listForUser(user_id, {
        page: Number(page),
        pageSize: Number(pageSize),
        search,
        status: status || undefined,
      });
      res.status(200).json({ status: true, message: "Successfully get tickets", data });
    } catch (error) {
      next(error);
    }
  }
);

AccountRoute.post(
  "/support",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, email } = req.jwt_payload!;
      const data = await SupportService.createForUser(req.body, {
        user_id,
        email,
        name: (req.body?.requester_name as string) || null,
      });
      res.status(201).json({ status: true, message: "Ticket created successfully", data });
    } catch (error) {
      next(error);
    }
  }
);

AccountRoute.get(
  "/support/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.jwt_payload!;
      const data = await SupportService.detailForUser(Number(req.params.id), user_id);
      res.status(200).json({ status: true, message: "Successfully get ticket detail", data });
    } catch (error) {
      next(error);
    }
  }
);

AccountRoute.post(
  "/support/:id/reply",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, email } = req.jwt_payload!;
      const data = await SupportService.replyForUser(Number(req.params.id), req.body, {
        user_id,
        email,
      });
      res.status(201).json({ status: true, message: "Reply sent successfully", data });
    } catch (error) {
      next(error);
    }
  }
);

AccountRoute.put(
  "/profile",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.jwt_payload!.user_id;
      const data = await AccountService.updateProfile(userId, req.body);

      res.status(200).json({
        status: true,
        message: "Profile updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AccountRoute.post(
  "/change-password",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.jwt_payload!.user_id;
      await AccountService.changePassword(userId, req.body);

      res.status(200).json({
        status: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default AccountRoute;
