import { Op, QueryTypes } from "sequelize";
import { Deposit, sequelize_main } from "../databases/main.db";
import { ErrNotFound } from "../config/errors";

interface ListParams {
  page: number;
  pageSize: number;
  status?: string | undefined;
  search?: string | undefined;
}

interface CreateDepositPayload {
  user_id: string;
  amount: number;
  method: string;
  sender_name?: string | null;
  proof_url?: string | null;
}

export class DepositRepository {
  static async create(payload: CreateDepositPayload) {
    const deposit = await Deposit.create({
      user_id: payload.user_id,
      amount: payload.amount,
      method: payload.method,
      sender_name: payload.sender_name ?? null,
      proof_url: payload.proof_url ?? null,
      status: "PENDING",
    });
    return deposit.get({ plain: true });
  }

  static async listForUser(userId: string, params: ListParams) {
    const { page, pageSize, status } = params;
    const where: Record<string, unknown> = { user_id: userId };
    if (status) where.status = status;

    const { rows, count } = await Deposit.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["created_at", "DESC"]],
    });

    return {
      data: rows.map((r) => r.get({ plain: true })),
      paginate: { page, pageSize, total: count },
    };
  }

  static async listForAdmin(params: ListParams) {
    const { page, pageSize, status, search } = params;

    const conditions: string[] = [];
    const replacements: Record<string, unknown> = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    if (status) {
      conditions.push("d.status = :status");
      replacements.status = status;
    }
    if (search) {
      conditions.push(
        "(u.email ILIKE :search OR u.display_name ILIKE :search OR d.sender_name ILIKE :search)"
      );
      replacements.search = `%${search}%`;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows: any[] = await sequelize_main.query(
      `
      SELECT d.id, d.user_id, u.email AS user_email, u.display_name AS user_name,
             d.amount::float AS amount, d.method, d.sender_name, d.proof_url,
             d.status, d.admin_note, d.confirmed_by, d.confirmed_at, d.created_at
      FROM apps.deposits d
      LEFT JOIN apps.users u ON u.id = d.user_id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT :limit OFFSET :offset
      `,
      { replacements, type: QueryTypes.SELECT }
    );

    const [countRow]: any = await sequelize_main.query(
      `
      SELECT COUNT(*)::int AS total
      FROM apps.deposits d
      LEFT JOIN apps.users u ON u.id = d.user_id
      ${whereClause}
      `,
      { replacements, type: QueryTypes.SELECT }
    );

    return {
      data: rows,
      paginate: { page, pageSize, total: countRow?.total ?? 0 },
    };
  }

  static async getById(id: number) {
    const deposit = await Deposit.findByPk(id);
    if (!deposit) {
      throw new ErrNotFound("Deposit not found");
    }
    return deposit.get({ plain: true });
  }

  static async countPendingForUser(userId: string): Promise<number> {
    return await Deposit.count({ where: { user_id: userId, status: "PENDING" } });
  }
}
