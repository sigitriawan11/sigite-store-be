import { NextFunction, Request, Response, Router } from "express";
import passport from "../config/passport"
import { Auth } from "../config/auth";
import { Helpers } from "../helpers/Helpers";
import { AuthService } from "../services/auth";
import { guestMiddleware } from "../middlerware/guest-middleware";
import { Validation } from "../validation";
import { AuthValidation } from "../validation/auth.validation";
import { CONFIG_COOKIES_ACCESS_TOKEN, CONFIG_COOKIES_REFRESH_TOKEN } from "../constant/auth";

const AuthRoute = Router();

AuthRoute.get(
  "/google",
  guestMiddleware,
  passport.authenticate("google", { scope: ["profile", "email"] })
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

      res.redirect(`${process.env.URL_FE}/dashboard`);
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

export default AuthRoute