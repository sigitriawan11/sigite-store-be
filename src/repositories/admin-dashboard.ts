import { QueryTypes } from "sequelize";
import { sequelize_main } from "../databases/main.db";

export class AdminDashboardRepository {
  static async getSummary() {
    const [totals]: any = await sequelize_main.query(
      `
      SELECT
        (SELECT COUNT(*)::int FROM apps.users WHERE deleted_at IS NULL) AS total_users,
        (SELECT COUNT(*)::int FROM apps.transactions) AS total_transactions,
        (SELECT COALESCE(SUM(amount), 0)::float FROM apps.transactions WHERE status = 'PAID') AS total_revenue,
        (SELECT COALESCE(SUM(amount), 0)::float FROM apps.transactions
            WHERE status = 'PAID' AND paid_at::date = (NOW() AT TIME ZONE 'Asia/Jakarta')::date) AS revenue_today,
        (SELECT COUNT(*)::int FROM apps.transactions
            WHERE created_at::date = (NOW() AT TIME ZONE 'Asia/Jakarta')::date) AS orders_today
      `,
      { type: QueryTypes.SELECT }
    );

    const statusCounts: any[] = await sequelize_main.query(
      `SELECT status, COUNT(*)::int AS count FROM apps.transactions GROUP BY status`,
      { type: QueryTypes.SELECT }
    );

    const recentTransactions: any[] = await sequelize_main.query(
      `
      SELECT ref_id, product_code, channel_code, amount::float AS amount, email, status, created_at
      FROM apps.transactions
      ORDER BY created_at DESC
      LIMIT 5
      `,
      { type: QueryTypes.SELECT }
    );

    const revenueSeries: any[] = await sequelize_main.query(
      `
      SELECT
        d::date AS date,
        COALESCE(SUM(t.amount), 0)::float AS revenue,
        COUNT(t.id)::int AS orders
      FROM generate_series(
        (NOW() AT TIME ZONE 'Asia/Jakarta')::date - INTERVAL '6 days',
        (NOW() AT TIME ZONE 'Asia/Jakarta')::date,
        INTERVAL '1 day'
      ) AS d
      LEFT JOIN apps.transactions t
        ON t.status = 'PAID' AND t.paid_at::date = d::date
      GROUP BY d
      ORDER BY d ASC
      `,
      { type: QueryTypes.SELECT }
    );

    const statusMap: Record<string, number> = {
      PENDING: 0,
      PAID: 0,
      FAILED: 0,
      EXPIRED: 0,
    };
    for (const row of statusCounts) {
      statusMap[row.status] = row.count;
    }

    return {
      totals: {
        total_users: totals?.total_users ?? 0,
        total_transactions: totals?.total_transactions ?? 0,
        total_revenue: totals?.total_revenue ?? 0,
        revenue_today: totals?.revenue_today ?? 0,
        orders_today: totals?.orders_today ?? 0,
      },
      status_counts: statusMap,
      recent_transactions: recentTransactions,
      revenue_series: revenueSeries,
    };
  }
}
