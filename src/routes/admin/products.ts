import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { ProductService } from "../../services/product";

const AdminProductRoute = Router();

AdminProductRoute.get(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin", "User"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        search = "",
        categoryId = null,
      } = req.query as {
        page: string;
        pageSize: string;
        search: string;
        categoryId: string | null;
      };

      const data = await ProductService.getAdminProductList({
        page: Number(page),
        pageSize: Number(pageSize),
        search,
        categoryId: categoryId ? Number(categoryId) : null,
      });

      res.status(200).json({
        status: true,
        message: "Successfully get product list",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default AdminProductRoute;