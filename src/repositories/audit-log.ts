import { Op } from "sequelize";
import { AuditLog } from "../databases/main.db";
import { AuditLogAttributes } from "../models/audit-log.model";

interface ListAuditParams {
  page: number;
  pageSize: number;
  search: string;
  action?: string | undefined;
  resource?: string | undefined;
}

type CreateAuditPayload = Omit<AuditLogAttributes, "id" | "created_at">;

export class AuditLogRepository {
  static async create(payload: CreateAuditPayload) {
    const log = await AuditLog.create(payload);
    return log.get({ plain: true });
  }

  static async list(payload: ListAuditParams) {
    const { page, pageSize, search, action, resource } = payload;

    const where: Record<string, unknown> = {};

    if (action) {
      where.action = action;
    }
    if (resource) {
      where.resource = resource;
    }
    if (search) {
      where[Op.or as any] = [
        { actor_email: { [Op.iLike]: `%${search}%` } },
        { resource: { [Op.iLike]: `%${search}%` } },
        { resource_id: { [Op.iLike]: `%${search}%` } },
        { path: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["created_at", "DESC"]],
    });

    return {
      data: rows.map((row) => row.get({ plain: true })),
      paginate: {
        page,
        pageSize,
        total: count,
      },
    };
  }
}
