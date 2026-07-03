import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { CategoryService } from "../../services/category";
import { multerMiddleware } from "../../config/multer";

const AdminCategoryRoute = Router();

AdminCategoryRoute.get(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin", "User"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        search = "",
      } = req.query as {
        page: string;
        pageSize: string;
        search: string;
      };

      const data = await CategoryService.getCategoryList({
        page: Number(page),
        pageSize: Number(pageSize),
        search,
      });

      res.status(200).json({
        status: true,
        message: "Successfully get category list",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminCategoryRoute.patch(
  "/:id/toggle-status",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const category = await CategoryService.toggleCategoryStatus(Number(id));

      res.status(200).json({
        status: true,
        message: "Successfully updated category status",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminCategoryRoute.post(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  multerMiddleware.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, display_name } = req.body;

      if (!name) {
        res.status(400).json({
          status: false,
          message: "Name is required",
        });
        return;
      }

      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      let image: string | null = null;
      if (req.file) {
        image = `/uploads/${req.file.filename}`;
      }

      const category = await CategoryService.createCategory({
        name: name.toUpperCase(),
        display_name: display_name || name,
        slug,
        image,
      });

      res.status(201).json({
        status: true,
        message: "Successfully created category",
        data: category,
      });
    } catch (error: any) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        res.status(409).json({
          status: false,
          message: "Category with this name already exists",
        });
        return;
      }
      next(error);
    }
  }
);

AdminCategoryRoute.put(
  "/:id",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  multerMiddleware.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, display_name } = req.body;

      const payload: {
        name?: string;
        display_name?: string;
        slug?: string;
        image?: string;
      } = {};

      if (name) {
        payload.name = String(name).toUpperCase();
        payload.slug = String(name)
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      }
      if (display_name !== undefined) {
        payload.display_name = display_name;
      }
      if (req.file) {
        payload.image = `/uploads/${req.file.filename}`;
      }

      const category = await CategoryService.updateCategory(Number(id), payload);

      res.status(200).json({
        status: true,
        message: "Successfully updated category",
        data: category,
      });
    } catch (error: any) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        res.status(409).json({
          status: false,
          message: "Category with this name already exists",
        });
        return;
      }
      next(error);
    }
  }
);

export default AdminCategoryRoute;