import { Request, Response, NextFunction } from "express";
import md5 from "md5";
import { ErrUnauthorized } from "../config/errors";






export function xenditWebhookVerification(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const callbackToken = req.headers["x-callback-token"] as string;
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

  if (!expectedToken) {
    console.warn(
      "[SECURITY] XENDIT_WEBHOOK_TOKEN not configured! Webhook verification disabled."
    );
    
    return next();
  }

  if (!callbackToken) {
    return next(
      new ErrUnauthorized("Missing x-callback-token header")
    );
  }

  if (callbackToken !== expectedToken) {
    return next(
      new ErrUnauthorized("Invalid x-callback-token")
    );
  }

  next();
}













export function digiflazzWebhookVerification(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_KEY;

  if (!username || !apiKey) {
    console.warn(
      "[SECURITY] DIGIFLAZZ credentials not configured! Webhook verification disabled."
    );
    return next();
  }

  
  const payload = req.body?.data || req.body;
  const refId = payload?.ref_id;
  const receivedSign = payload?.sign;

  if (!refId || !receivedSign) {
    return next(
      new ErrUnauthorized("Missing ref_id or sign in Digiflazz webhook payload")
    );
  }

  
  const expectedSign = md5(username + apiKey + refId);

  if (receivedSign !== expectedSign) {
    console.warn(
      `[SECURITY] Digiflazz webhook signature mismatch for ref_id: ${refId}`
    );
    return next(
      new ErrUnauthorized("Invalid Digiflazz webhook signature")
    );
  }

  next();
}