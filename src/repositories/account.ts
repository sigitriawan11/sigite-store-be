import { Op, QueryTypes } from "sequelize";
import { Transaction, sequelize_main } from "../databases/main.db";

interface TxListParams {
  page: number;
  pageSize: number;
  status?: string | undefined;
  search?: string | undefined;
}

export class AccountRepository {
  static async ownTransactions(userId: string, email: string, params: TxListParams) {
    const { page, pageSize, status, search } = params;
    const where: Record<string, unknown> = {};
    where[Op.or as any] = [{ user_id: userId }, { email }];
    if (status) where.status = status;
    if (search) {
      where[Op.and as any] = [
        {
          [Op.or]: [
            { ref_id: { [Op.iLike]: `%${search}%` } },
            { product_code: { [Op.iLike]: `%${search}%` } },
          ],
        },
      ];
    }

    const { rows, count } = await Transaction.findAndCountAll({
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

  static async getBalance(userId: string): Promise<number> {
    const rows: any[] = await sequelize_main.query(
      `SELECT balance::float AS balance FROM apps.user_balances WHERE user_id = :user_id LIMIT 1`,
      { replacements: { user_id: userId }, type: QueryTypes.SELECT }
    );
    return rows.length ? Number(rows[0].balance) : 0;
  }

  static async walletLogs(userId: string, page: number, pageSize: number) {
    const rows: any[] = await sequelize_main.query(
      `SELECT id, type, amount::float AS amount, balance_before::float AS balance_before,
              balance_after::float AS balance_after, transaction_id, description, created_at
       FROM apps.balance_logs
       WHERE user_id = :user_id
       ORDER BY created_at DESC
       LIMIT :limit OFFSET :offset`,
      {
        replacements: { user_id: userId, limit: pageSize, offset: (page - 1) * pageSize },
        type: QueryTypes.SELECT,
      }
    );

    const [countRow]: any = await sequelize_main.query(
      `SELECT COUNT(*)::int AS total FROM apps.balance_logs WHERE user_id = :user_id`,
      { replacements: { user_id: userId }, type: QueryTypes.SELECT }
    );

    return { logs: rows, paginate: { page, pageSize, total: countRow?.total ?? 0 } };
  }

  static async dashboardSummary(userId: string, email: string) {
    const balance = await this.getBalance(userId);

    const [txAgg]: any = await sequelize_main.query(
      `SELECT
         COUNT(*)::int AS total_transactions,
         COUNT(*) FILTER (WHERE status = 'PAID')::int AS paid_transactions,
         COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::float AS total_spent
       FROM apps.transactions
       WHERE user_id = :uid OR email = :email`,
      { replacements: { uid: userId, email }, type: QueryTypes.SELECT }
    );

    const recent: any[] = await sequelize_main.query(
      `SELECT ref_id, product_code, amount::float AS amount, status, created_at
       FROM apps.transactions
       WHERE user_id = :uid OR email = :email
       ORDER BY created_at DESC
       LIMIT 5`,
      { replacements: { uid: userId, email }, type: QueryTypes.SELECT }
    );

    const [depAgg]: any = await sequelize_main.query(
      `SELECT COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending_deposits
       FROM apps.deposits WHERE user_id = :user_id`,
      { replacements: { user_id: userId }, type: QueryTypes.SELECT }
    );

    return {
      balance,
      total_transactions: txAgg?.total_transactions ?? 0,
      paid_transactions: txAgg?.paid_transactions ?? 0,
      total_spent: txAgg?.total_spent ?? 0,
      pending_deposits: depAgg?.pending_deposits ?? 0,
      recent_transactions: recent,
    };
  }
}
