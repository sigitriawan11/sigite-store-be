import { NextFunction, Request, Response } from "express";
import { AuditLogService } from "../services/audit-log";
import { Helpers } from "../helpers/Helpers";

const METHOD_ACTION: Record<string, string> = {
  POST: "CREATE",
  PUT: "UPDATE",
  PATCH: "UPDATE",
  DELETE: "DELETE",
};

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const action = METHOD_ACTION[req.method];

  if (!action) {
    return next();
  }

  const method = req.method;
  const ip = Helpers.getClientIp(req);
  const fullPath = (req.originalUrl || req.url || "").split("?")[0] ?? "";
  const segments = fullPath.split("/").filter(Boolean);
  const adminIdx = segments.indexOf("admin");
  const resource = adminIdx >= 0 ? segments[adminIdx + 1] ?? null : segments[0] ?? null;

  let resourceId: string | null = null;
  if (resource) {
    const resIdx = segments.indexOf(resource);
    const candidate = segments[resIdx + 1];
    if (candidate && candidate !== "status" && candidate !== "reply") {
      resourceId = candidate;
    }
  }

  res.on("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return;
    }

    void AuditLogService.log({
      user_id: req.jwt_payload?.user_id ?? null,
      actor_email: req.jwt_payload?.email ?? null,
      action,
      resource,
      resource_id: resourceId,
      method,
      path: fullPath,
      status_code: res.statusCode,
      ip_address: ip,
      metadata: {},
    });
  });

  next();
};
