import { QueryTypes } from "sequelize";
import { sequelize_main } from "../databases/main.db";

interface ReportParams {
  date_from: string;
  date_to: string;
}

export class AdminReportRepository {
  static async getReport({ date_from, date_to }: ReportParams) {
    const replacements = {
      from: `${date_from} 00:00:00`,
      to: `${date_to} 23:59:59.999`,
    };

    const [summary]: any = await sequelize_main.query(
      `
      SELECT
        COUNT(*)::int AS total_orders,
        COUNT(*) FILTER (WHERE status = 'PAID')::int AS paid_orders,
        COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::float AS total_revenue
      FROM apps.transactions
      WHERE created_at BETWEEN :from AND :to
      `,
      { replacements, type: QueryTypes.SELECT }
    );

    const statusBreakdown: any[] = await sequelize_main.query(
      `
      SELECT
        status,
        COUNT(*)::int AS count,
        COALESCE(SUM(amount), 0)::float AS revenue
      FROM apps.transactions
      WHERE created_at BETWEEN :from AND :to
      GROUP BY status
      ORDER BY count DESC
      `,
      { replacements, type: QueryTypes.SELECT }
    );

    const topProducts: any[] = await sequelize_main.query(
      `
      SELECT
        product_code,
        COUNT(*)::int AS count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::float AS revenue
      FROM apps.transactions
      WHERE created_at BETWEEN :from AND :to
      GROUP BY product_code
      ORDER BY count DESC
      LIMIT 10
      `,
      { replacements, type: QueryTypes.SELECT }
    );

    const dailySeries: any[] = await sequelize_main.query(
      `
      SELECT
        d::date AS date,
        COUNT(t.id)::int AS orders,
        COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'PAID'), 0)::float AS revenue
      FROM generate_series(:from::date, :to::date, INTERVAL '1 day') AS d
      LEFT JOIN apps.transactions t ON t.created_at::date = d::date
      GROUP BY d
      ORDER BY d ASC
      `,
      { replacements, type: QueryTypes.SELECT }
    );

    const totalOrders = summary?.total_orders ?? 0;
    const paidOrders = summary?.paid_orders ?? 0;
    const successRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

    return {
      range: { date_from, date_to },
      summary: {
        total_orders: totalOrders,
        paid_orders: paidOrders,
        total_revenue: summary?.total_revenue ?? 0,
        success_rate: Number(successRate.toFixed(2)),
      },
      status_breakdown: statusBreakdown,
      top_products: topProducts,
      daily_series: dailySeries,
    };
  }
}
