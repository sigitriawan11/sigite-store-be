import { NextFunction, Request, Response, Router } from "express";
import passport from "../config/passport"
import { Auth } from "../config/auth";
import { Helpers } from "../helpers/Helpers";
import { AuthService } from "../services/auth";
import { guestMiddleware } from "../middlerware/guest-middleware";
import { authMiddleware } from "../middlerware/auth-middleware";
import { Validation } from "../validation";
import { AuthValidation } from "../validation/auth.validation";
import { CONFIG_COOKIES_ACCESS_TOKEN, CONFIG_COOKIES_REFRESH_TOKEN } from "../constant/auth";
import { AuthRepositories } from "../repositories/auth";
import { v4 as uuidv4 } from 'uuid';

const AuthRoute = Router();

AuthRoute.get(
  "/google",
  guestMiddleware,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

AuthRoute.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  async (req: any, res) => {
    try {
      const { token, token_refresh } = await AuthService.loginProvider({
        ...req.user,
        user_agent: Helpers.getUserAgent(req),
        ip_address: Helpers.getClientIp(req)
      })

      res.cookie("access_token", token, CONFIG_COOKIES_ACCESS_TOKEN);

      res.cookie("refresh_token", token_refresh, CONFIG_COOKIES_REFRESH_TOKEN);

      res.redirect(`${process.env.URL_FE}/admin/dashboard`);
    } catch (error: any) {
      if (error.message === "User is inactive") {
        return res.redirect(`${process.env.URL_FE}/login?error=inactive_user`);
      }

      return res.redirect(`${process.env.URL_FE}/login?error=server_error`);
    }
  }
);

AuthRoute.post(
  "/register",
  guestMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = Validation.validate(AuthValidation.register, req.body)

      const result = await AuthService.registerUser(body)

      res.status(200).json({
        status: true,
        message: "Your account has been created successfully.",
        data: result
      })
    } catch (error) {
      next(error)
    }
  }
)

AuthRoute.post(
  "/login",
  guestMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = Validation.validate(AuthValidation.login, req.body)

      const result = await AuthService.login({
        ...body,
        user_agent: Helpers.getUserAgent(req),
        ip_address: Helpers.getClientIp(req)
      })

      res.cookie("access_token", result.access_token, CONFIG_COOKIES_ACCESS_TOKEN);

      res.cookie("refresh_token", result.refresh_token, CONFIG_COOKIES_REFRESH_TOKEN);

      res.status(200).json({
        status: true,
        message: "You have successfully logged in.",
        data: result
      })
    } catch (error) {
      next(error)
    }
  }
)






AuthRoute.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token;

      if (!refresh_token) {
        return res.status(401).json({
          status: false,
          message: "Refresh token not found",
        });
      }

      
      const decoded = await Auth.validate(refresh_token, true);

      
      const session_id = uuidv4();

      const new_access_token = Auth.createToken({
        session_id: session_id,
        user_id: decoded.user_id,
        email: decoded.email,
        role_id: decoded.role_id,
      });

      const new_refresh_token = Auth.createToken({
        session_id: session_id,
        user_id: decoded.user_id,
        email: decoded.email,
        role_id: decoded.role_id,
      }, "3d");

      const result = await AuthRepositories.refreshToken({
        refresh_token: refresh_token,
        new_access_token: new_access_token,
        new_refresh_token: new_refresh_token,
        user_agent: Helpers.getUserAgent(req),
        ip_address: Helpers.getClientIp(req),
        expires_at: null as any,
      });

      if (!result) {
        return res.status(401).json({
          status: false,
          message: "Session not found or already refreshed",
        });
      }

      
      res.cookie("access_token", new_access_token, CONFIG_COOKIES_ACCESS_TOKEN);
      res.cookie("refresh_token", new_refresh_token, CONFIG_COOKIES_REFRESH_TOKEN);

      
      const { UserRepository } = await import("../repositories/user");
      const user = await UserRepository.findUserByEmailNotDeleted(decoded.email);

      const { sequelize_main } = await import("../databases/main.db");
      const [roleRows]: any = await sequelize_main.query(
        `SELECT name FROM apps.roles WHERE id = :id LIMIT 1`,
        { replacements: { id: decoded.role_id } }
      );
      const role_name = roleRows?.[0]?.name || "User";

      
      const [balanceRows]: any = await sequelize_main.query(
        `SELECT balance FROM apps.user_balances WHERE user_id = :user_id LIMIT 1`,
        { replacements: { user_id: decoded.user_id } }
      );
      const wallet_balance = balanceRows?.[0]?.balance 
        ? parseFloat(balanceRows[0].balance) 
        : 0;

      const { password, ...safeUser } = user || {};

      res.json({
        status: true,
        message: "Token refreshed successfully",
        data: {
          ...safeUser,
          user_id: decoded.user_id,
          role_id: decoded.role_id,
          role_name,
          wallet_balance,
          access_token: new_access_token,
          refresh_token: new_refresh_token,
        },
      });
    } catch (error) {
      
      res.clearCookie("access_token", { path: "/" });
      res.clearCookie("refresh_token", { path: "/" });

      return res.status(401).json({
        status: false,
        message: "Refresh token is invalid or expired. Please login again.",
      });
    }
  }
);






AuthRoute.get(
  "/session",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, email, role_id } = req.jwt_payload!;

      const { UserRepository } = await import("../repositories/user");
      const user = await UserRepository.findUserByEmailNotDeleted(email);

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "User not found",
          data: null,
        });
      }

      
      const { sequelize_main } = await import("../databases/main.db");
      const [roleRows]: any = await sequelize_main.query(
        `SELECT name FROM apps.roles WHERE id = :id LIMIT 1`,
        { replacements: { id: role_id } }
      );
      const role_name = roleRows?.[0]?.name || "User";

      
      const [balanceRows]: any = await sequelize_main.query(
        `SELECT balance FROM apps.user_balances WHERE user_id = :user_id LIMIT 1`,
        { replacements: { user_id } }
      );
      const wallet_balance = balanceRows?.[0]?.balance 
        ? parseFloat(balanceRows[0].balance) 
        : 0;

      const { password, ...safeUser } = user;

      res.json({
        status: true,
        message: "Session fetched successfully",
        data: {
          ...safeUser,
          user_id,
          role_id,
          role_name,
          wallet_balance,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);





AuthRoute.post(
  "/logout",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { session_id } = req.jwt_payload!;

      
      if (session_id) {
        await AuthRepositories.revokeToken(session_id);
      }

      res.clearCookie("access_token", { path: "/" });
      res.clearCookie("refresh_token", { path: "/" });

      res.json({
        status: true,
        message: "You have been logged out successfully.",
      });
    } catch (error) {
      
      res.clearCookie("access_token", { path: "/" });
      res.clearCookie("refresh_token", { path: "/" });

      res.json({
        status: true,
        message: "You have been logged out successfully.",
      });
    }
  }
);

export default AuthRoute