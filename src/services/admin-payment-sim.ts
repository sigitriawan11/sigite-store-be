import { Op } from "sequelize";
import { Transaction } from "../databases/main.db";
import { TransactionRepository } from "../repositories/transaction";
import { WebhookService } from "./webhook";
import { ErrBadRequest, ErrNotFound } from "../config/errors";

interface ListPendingParams {
  page: number;
  pageSize: number;
  search: string;
}

export class AdminPaymentSimService {
  static async listPending(payload: ListPendingParams) {
    const { page, pageSize, search } = payload;

    const where: Record<string, unknown> = { status: "PENDING" };

    if (search) {
      where[Op.or as any] = [
        { ref_id: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { product_code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Transaction.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["created_at", "DESC"]],
    });

    return {
      data: rows.map((row) => row.get({ plain: true })),
      paginate: { page, pageSize, total: count },
    };
  }

  static async pay(ref_id: string) {
    const transaction = await TransactionRepository.findByRefId(ref_id);

    if (!transaction) {
      throw new ErrNotFound("Transaction not found");
    }

    if (transaction.status !== "PENDING") {
      throw new ErrBadRequest(
        `Transaction is already ${transaction.status}, only PENDING can be paid`
      );
    }

    const result = await WebhookService.handleXenditCallback({
      event: "payment_request.paid",
      data: { reference_id: ref_id },
    });

    const updated = await TransactionRepository.findByRefId(ref_id);

    return { result, transaction: updated };
  }
}
