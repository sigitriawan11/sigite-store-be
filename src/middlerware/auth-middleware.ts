import { Request, Response, NextFunction } from "express";
import { ErrBadRequest, ErrUnauthorized } from "../config/errors";
import { Auth } from "../config/auth";
import { AuthRepositories } from "../repositories/auth";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies.access_token;
    
    if (!token) {
      throw new ErrUnauthorized();
    }

    token = token.replace(/Bearer /g, "");
    
    const auth = await Auth.validate(token, true)

    await AuthRepositories.checkRevokeToken(auth.session_id)

    req.jwt_payload = auth
    req.jwt_token = token;
    return next();
  } catch (error) {
    next(error);
  }
};
