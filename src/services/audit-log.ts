import { AuditLogRepository } from "../repositories/audit-log";
import { AuditLogAttributes } from "../models/audit-log.model";

interface ListAuditParams {
  page: number;
  pageSize: number;
  search: string;
  action?: string | undefined;
  resource?: string | undefined;
}

type LogPayload = Partial<Omit<AuditLogAttributes, "id" | "created_at" | "action">> & {
  action: string;
};

export class AuditLogService {
  static async log(payload: LogPayload) {
    try {
      await AuditLogRepository.create({
        user_id: payload.user_id ?? null,
        actor_email: payload.actor_email ?? null,
        action: payload.action,
        resource: payload.resource ?? null,
        resource_id: payload.resource_id ?? null,
        method: payload.method ?? null,
        path: payload.path ?? null,
        status_code: payload.status_code ?? null,
        ip_address: payload.ip_address ?? null,
        metadata: payload.metadata ?? {},
      });
    } catch (err) {
      console.error("[audit] failed to write audit log:", (err as Error)?.message);
    }
  }

  static async list(payload: ListAuditParams) {
    return await AuditLogRepository.list(payload);
  }
}
