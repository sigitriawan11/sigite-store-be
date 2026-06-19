import { Router, Request, Response, NextFunction } from "express";
import { MenuRepositories } from "../repositories/menu";
import { authMiddleware } from "../middlerware/auth-middleware";

const router = Router();

router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = req.jwt_payload!.role_id;
      const menus = await MenuRepositories.getMenusByRoleId(roleId);
      res.json({ status: true, data: menus });
    } catch (error) {
      next(error);
    }
  }
);

export default router;