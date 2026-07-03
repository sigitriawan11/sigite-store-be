import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../middlerware/auth-middleware";
import { RoleMiddleware } from "../../middlerware/role-middleware";
import { AdminUserService } from "../../services/admin-users";

const AdminUserRoute = Router();

AdminUserRoute.get(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin"),
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

      const data = await AdminUserService.listUsers({
        page: Number(page),
        pageSize: Number(pageSize),
        search,
      });

      res.status(200).json({
        status: true,
        message: "Successfully get user list",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminUserRoute.get(
  "/:id",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const data = await AdminUserService.getUserById(id);

      res.status(200).json({
        status: true,
        message: "Successfully get user detail",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminUserRoute.post(
  "/",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminUserService.createUser(req.body);

      res.status(201).json({
        status: true,
        message: "User created successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminUserRoute.put(
  "/:id",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { display_name, phone_number, role_id, is_active, is_verified } = req.body;
      const currentUserId = req.jwt_payload?.user_id;

      const data = await AdminUserService.updateUser(
        id,
        { display_name, phone_number, role_id, is_active, is_verified },
        currentUserId
      );

      res.status(200).json({
        status: true,
        message: "User updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

AdminUserRoute.delete(
  "/:id",
  authMiddleware,
  RoleMiddleware("Super Admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const currentUserId = req.jwt_payload?.user_id;

      await AdminUserService.softDeleteUser(id, currentUserId);

      res.status(200).json({
        status: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default AdminUserRoute;