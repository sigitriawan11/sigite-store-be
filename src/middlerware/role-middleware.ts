import { NextFunction, Request, Response } from "express";
import { Helpers } from "../helpers/Helpers";
import { RoleName } from "../constant/role";
import { ErrForbidden, ErrUnauthorized } from "../config/errors";

export const RoleMiddleware = (...roles: RoleName[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.jwt_payload;

            if (!user) {
                throw new ErrUnauthorized()
            }

            const allowedRoleIds = roles.map(Helpers.getRoleIdByName);

            if (!allowedRoleIds.includes(user.role_id)) {
                throw new ErrForbidden()
            }

            next();
        } catch (error) {
            next(error)
        }
    };
};