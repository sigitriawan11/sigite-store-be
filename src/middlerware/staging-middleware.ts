import { NextFunction, Request, Response } from "express";
import { ErrForbidden } from "../config/errors";

export const stagingOnlyMiddleware = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV !== "STAGING") {
    return next(new ErrForbidden("This resource is only available in staging"));
  }
  next();
};
