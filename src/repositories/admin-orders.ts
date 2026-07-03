import { Op } from "sequelize";
import { Transaction } from "../databases/main.db";
import { ErrNotFound } from "../config/errors";
import { TransactionStatus } from "../types/transaction-type";

interface ListOrdersParams {
  page: number;
  pageSize: number;
  search: string;
  status?: string | undefined;
  date_from?: string | undefined;
  date_to?: string | undefined;
}

export class AdminOrderRepository {
  static async list(payload: ListOrdersParams) {
    const { page, pageSize, search, status, date_from, date_to } = payload;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or as any] = [
        { ref_id: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { product_code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (date_from || date_to) {
      const createdAt: Record<symbol, Date> = {};
      if (date_from) {
        createdAt[Op.gte] = new Date(`${date_from}T00:00:00`);
      }
      if (date_to) {
        createdAt[Op.lte] = new Date(`${date_to}T23:59:59.999`);
      }
      where.created_at = createdAt;
    }

    const { rows, count } = await Transaction.findAndCountAll({
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

  static async getByRefId(ref_id: string) {
    const transaction = await Transaction.findOne({ where: { ref_id } });

    if (!transaction) {
      throw new ErrNotFound("Order not found");
    }

    return transaction.get({ plain: true });
  }

  static async updateStatus(ref_id: string, status: TransactionStatus) {
    const transaction = await Transaction.findOne({ where: { ref_id } });

    if (!transaction) {
      throw new ErrNotFound("Order not found");
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "PAID" && !transaction.get("paid_at")) {
      updateData.paid_at = new Date();
    }

    await Transaction.update(updateData, { where: { ref_id } });

    const updated = await Transaction.findOne({ where: { ref_id } });
    return updated?.get({ plain: true });
  }
}
