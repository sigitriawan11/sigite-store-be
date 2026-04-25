import { Request, Response, NextFunction } from "express";
import { ErrBadRequest, ErrForbidden, ErrUnauthorized } from "../config/errors";

export const guestMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.cookies.access_token) {
      throw new ErrForbidden();
    }

    return next();
  } catch (error) {
    next(error);
  }
};
